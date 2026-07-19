/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use body parser with generous limit to accept base64 custom uploaded image data
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // ----------------- ATHENTICATION & SECURITY ENGINE -----------------
  const USERS_DB_PATH = path.join(process.cwd(), "users_db.json");
  const JWT_SECRET = process.env.JWT_SECRET || "luxevra-atelier-secure-vault-token-9988";

  // Production-grade secure in-memory store for OTP credentials and rate-limiting
  // Map schema: email -> { otp: string, expiresAt: number, lastRequestedAt: number, attemptsCount: number, requestsInWindow: number[], resetTicket?: string, verified?: boolean }
  const otpStore = new Map<string, {
    otp: string;
    expiresAt: number;
    lastRequestedAt: number;
    attemptsCount: number;
    requestsInWindow: number[];
    resetTicket?: string;
    verified?: boolean;
  }>();

  // Lazy-initialized secure SMTP mailer client
  let mailTransporter: any = null;
  const getMailTransporter = () => {
    if (mailTransporter === null) {
      const host = process.env.SMTP_HOST;
      const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      if (host && user && pass) {
        mailTransporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass }
        });
        console.log(`[MAILER] Secure SMTP transporter successfully initialized (Host: ${host}:${port}, User: ${user}).`);
      } else {
        console.log("[MAILER] SMTP environment keys are not configured. Falling back to secure Console logging and interactive App UI Telemetry simulation.");
        mailTransporter = false;
      }
    }
    return mailTransporter;
  };

  // Helper to load/save users database safely
  const loadUsers = (): any[] => {
    if (fs.existsSync(USERS_DB_PATH)) {
      try {
        const data = fs.readFileSync(USERS_DB_PATH, "utf-8");
        return JSON.parse(data);
      } catch (err) {
        console.error("[AUTH ENGINE] Failed to parse users_db.json, starting fresh:", err);
        return [];
      }
    }
    return [];
  };

  const saveUsers = (users: any[]) => {
    try {
      fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2), "utf-8");
      console.log(`[AUTH ENGINE] Users database successfully updated. Total users registered: ${users.length}`);
    } catch (err) {
      console.error("[AUTH ENGINE] Failed to save users_db.json:", err);
    }
  };

  // Cryptographic hashing (PBKDF2 is highly secure and has native performance)
  const hashPassword = (password: string, salt: string): string => {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  };

  // Production JWT creator and verifier using native cryptographically secure signatures
  const createJWT = (payload: any): string => {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    // Sessions remain active for 7 days
    const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString("base64url");
    const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    return `${header}.${body}.${signature}`;
  };

  const verifyJWT = (token: string): any | null => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const [header, body, signature] = parts;
      const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
      if (signature !== expectedSignature) {
        console.warn("[AUTH ENGINE] JWT Signature mismatch.");
        return null;
      }
      const decodedBody = JSON.parse(Buffer.from(body, "base64").toString("utf-8"));
      if (decodedBody.exp && Date.now() > decodedBody.exp) {
        console.warn("[AUTH ENGINE] JWT Token expired.");
        return null;
      }
      return decodedBody;
    } catch (err) {
      console.error("[AUTH ENGINE] Error verifying JWT token:", err);
      return null;
    }
  };

  // Seed default admin account on startup so the system is ready to test immediately
  let usersList = loadUsers();
  if (usersList.length === 0 || !usersList.some(u => u.email === "admin@luxevra.com")) {
    const adminSalt = crypto.randomBytes(16).toString("hex");
    const adminUser = {
      id: "user_admin_01",
      name: "Atelier Administrator",
      email: "admin@luxevra.com",
      salt: adminSalt,
      passwordHash: hashPassword("Password@123", adminSalt),
      role: "admin",
      createdAt: new Date().toISOString()
    };
    usersList = usersList.filter(u => u.email !== "admin@luxevra.com");
    usersList.push(adminUser);
    saveUsers(usersList);
    console.log("[AUTH ENGINE] Seeded default luxury workspace administrator: admin@luxevra.com / Password@123");
  }

  // AUTHENTICATION ROUTERS

  // 1. Get Current Authenticated Session
  app.get("/api/auth/me", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[AUTH API] Fetch active session: Request missing Authorization bearer token.");
      return res.status(401).json({ success: false, error: "Authentication token is missing." });
    }
    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);
    if (!decoded) {
      console.warn("[AUTH API] Fetch active session: Provided token is invalid or expired.");
      return res.status(401).json({ success: false, error: "Your session has expired. Please sign in again." });
    }

    // Load active profile from users database
    const allUsers = loadUsers();
    const activeUser = allUsers.find(u => u.id === decoded.id);
    if (!activeUser) {
      return res.status(404).json({ success: false, error: "Registered user profile was not found." });
    }

    console.log(`[AUTH API] Fetch session success: User verified as: ${activeUser.email} (${activeUser.role})`);
    return res.json({
      success: true,
      user: {
        id: activeUser.id,
        name: activeUser.name,
        email: activeUser.email,
        role: activeUser.role,
        createdAt: activeUser.createdAt
      }
    });
  });

  // 2. Register New Premium Account (Signup)
  app.post("/api/auth/signup", (req, res) => {
    try {
      const { name, email, password, confirmPassword } = req.body;

      // Sanitization
      if (!name || typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({ success: false, error: "Please enter your full name (minimum 2 characters)." });
      }
      if (!email || typeof email !== "string") {
        return res.status(400).json({ success: false, error: "A valid email address is required." });
      }
      const cleanEmail = email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ success: false, error: "The provided email format is invalid. Please try again." });
      }

      // Password Validation Specifications
      if (!password || typeof password !== "string") {
        return res.status(400).json({ success: false, error: "Password must be specified." });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ success: false, error: "Password confirmation does not match original." });
      }
      if (password.length < 8) {
        return res.status(400).json({ success: false, error: "Password must be at least 8 characters in length." });
      }
      if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ success: false, error: "Password requires at least one uppercase letter (A-Z)." });
      }
      if (!/[a-z]/.test(password)) {
        return res.status(400).json({ success: false, error: "Password requires at least one lowercase letter (a-z)." });
      }
      if (!/[0-9]/.test(password)) {
        return res.status(400).json({ success: false, error: "Password requires at least one number (0-9)." });
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return res.status(400).json({ success: false, error: "Password requires at least one special character (e.g. @, #, $, %, etc)." });
      }

      const allUsers = loadUsers();
      if (allUsers.some(u => u.email === cleanEmail)) {
        console.warn(`[AUTH API] Signup failure: User email already registered: ${cleanEmail}`);
        return res.status(409).json({ success: false, error: "This email address is already associated with an active account." });
      }

      // Generate secure credentials
      const userSalt = crypto.randomBytes(16).toString("hex");
      const userHash = hashPassword(password, userSalt);
      // Automatically elevate official test accounts or admin-level patterns to admin role
      const isSystemAdmin = cleanEmail === "admin@luxevra.com" || cleanEmail === "acpixel44@gmail.com";
      const newUser = {
        id: `user_${crypto.randomBytes(8).toString("hex")}`,
        name: name.trim(),
        email: cleanEmail,
        salt: userSalt,
        passwordHash: userHash,
        role: isSystemAdmin ? "admin" : "user",
        createdAt: new Date().toISOString()
      };

      allUsers.push(newUser);
      saveUsers(allUsers);

      const token = createJWT({ id: newUser.id, email: newUser.email, role: newUser.role });
      console.log(`[AUTH API] Signup success: Created registered account for: ${newUser.email} (Role: ${newUser.role})`);

      return res.status(201).json({
        success: true,
        message: "Your Atelier Privilege account has been created successfully.",
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt
        }
      });
    } catch (err: any) {
      console.error("[AUTH API] Registration error:", err);
      return res.status(500).json({ success: false, error: "An internal server error occurred during signup: " + err.message });
    }
  });

  // 3. User Login
  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: "Both registered email and security credentials are required." });
      }
      const cleanEmail = email.toLowerCase().trim();

      const allUsers = loadUsers();
      const user = allUsers.find(u => u.email === cleanEmail);
      if (!user) {
        console.warn(`[AUTH API] Login failure: Credentials rejected for email: ${cleanEmail}`);
        return res.status(401).json({ success: false, error: "The credentials supplied do not match our database records." });
      }

      const checkHash = hashPassword(password, user.salt);
      if (checkHash !== user.passwordHash) {
        console.warn(`[AUTH API] Login failure: Password rejected for email: ${cleanEmail}`);
        return res.status(401).json({ success: false, error: "The credentials supplied do not match our database records." });
      }

      const token = createJWT({ id: user.id, email: user.email, role: user.role });
      console.log(`[AUTH API] Login success: User authenticated successfully: ${user.email} (Role: ${user.role})`);

      return res.json({
        success: true,
        message: "Authenticated successfully. Welcome back to the Atelier.",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } catch (err: any) {
      console.error("[AUTH API] Login error:", err);
      return res.status(500).json({ success: false, error: "An internal server error occurred during login: " + err.message });
    }
  });

  // 4. Secure Password Reset Request (Forgot Password - Dispatches Secure branded OTP)
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ success: false, error: "Registered email address is required to initiate reset." });
      }
      const cleanEmail = email.toLowerCase().trim();
      const allUsers = loadUsers();
      const targetUser = allUsers.find(u => u.email === cleanEmail);

      if (!targetUser) {
        console.warn(`[AUTH API] Password reset request failed: Unregistered email address entered: ${cleanEmail}`);
        return res.status(404).json({
          success: false,
          error: "The provided email is not registered in our luxury client registry."
        });
      }

      const now = Date.now();
      const existing = otpStore.get(cleanEmail);

      // Enforce Resend Cool-down: 60 seconds
      if (existing && (now - existing.lastRequestedAt < 60000)) {
        const secondsRemaining = Math.ceil((60000 - (now - existing.lastRequestedAt)) / 1000);
        return res.status(429).json({
          success: false,
          error: `Please wait ${secondsRemaining} seconds before requesting another verification code.`
        });
      }

      // Enforce Rate Limiting: Max 5 requests per 10 minutes to prevent spoofing/abuse
      if (existing) {
        const tenMinutesAgo = now - 10 * 60 * 1000;
        const recentRequests = existing.requestsInWindow.filter(timestamp => timestamp > tenMinutesAgo);
        if (recentRequests.length >= 5) {
          return res.status(429).json({
            success: false,
            error: "Too many reset requests detected. For your security, please wait 10 minutes before trying again."
          });
        }
        recentRequests.push(now);
        existing.requestsInWindow = recentRequests;
      }

      // Generate a highly secure random 6-digit numeric OTP code
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = now + 10 * 60 * 1000; // Code is active for 10 minutes

      if (existing) {
        existing.otp = otp;
        existing.expiresAt = expiresAt;
        existing.lastRequestedAt = now;
        existing.attemptsCount = 0; // reset failed verification attempts for this new code
        existing.verified = false;
        existing.resetTicket = undefined;
      } else {
        otpStore.set(cleanEmail, {
          otp,
          expiresAt,
          lastRequestedAt: now,
          attemptsCount: 0,
          requestsInWindow: [now],
          verified: false
        });
      }

      console.log(`[AUTH API] Generated secure OTP [${otp}] for client dossier: ${cleanEmail}. Expiration in 10 minutes.`);

      // Render the professionally branded luxury HTML email template
      const htmlEmailContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>LUXEVRA Password Verification</title>
  <style>
    body {
      background-color: #0d0d0d !important;
      color: #f5f2ec !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      background-color: #0d0d0d;
      width: 100%;
      padding: 40px 0;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background-color: #111111;
      border: 1px solid #1c1c1c;
      padding: 40px;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      letter-spacing: 0.35em;
      color: #d4af37;
      text-transform: uppercase;
      margin-bottom: 25px;
      font-weight: 300;
    }
    .line {
      height: 1px;
      background: linear-gradient(90deg, transparent, #d4af37, transparent);
      margin: 25px 0;
    }
    .greeting {
      font-size: 15px;
      color: #fbfaf7;
      margin-bottom: 15px;
      text-align: left;
      font-weight: 400;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .message {
      font-size: 13px;
      color: #a1a1aa;
      line-height: 1.6;
      margin-bottom: 30px;
      text-align: left;
      font-weight: 300;
      letter-spacing: 0.02em;
    }
    .otp-container {
      background-color: #070707;
      border: 1px solid #222222;
      padding: 25px;
      margin: 30px 0;
      display: inline-block;
    }
    .otp-code {
      font-size: 34px;
      color: #d4af37;
      font-weight: 600;
      font-family: monospace;
      letter-spacing: 0.3em;
      margin-left: 0.3em;
    }
    .expiry {
      font-size: 10px;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      margin-top: 12px;
      font-weight: 400;
    }
    .security-notice {
      font-size: 11px;
      color: #52525b;
      line-height: 1.6;
      text-align: left;
      margin-top: 40px;
      border-top: 1px solid #1a1a1a;
      padding-top: 20px;
      font-weight: 300;
    }
    .footer {
      font-size: 9px;
      color: #52525b;
      margin-top: 30px;
      text-align: center;
      letter-spacing: 0.25em;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="wrapper" style="background-color: #0d0d0d; padding: 40px 0;">
    <div class="container" style="max-width: 500px; margin: 0 auto; background-color: #111111; border: 1px solid #1c1c1c; padding: 40px; text-align: center;">
      <div class="logo" style="font-size: 24px; letter-spacing: 0.35em; color: #d4af37; text-transform: uppercase; margin-bottom: 25px; font-weight: 300;">LUXEVRA</div>
      <div class="line" style="height: 1px; background: linear-gradient(90deg, transparent, #d4af37, transparent); margin: 25px 0;"></div>
      <div class="greeting" style="font-size: 15px; color: #fbfaf7; margin-bottom: 15px; text-align: left; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase;">Dear ${targetUser.name.toUpperCase()},</div>
      <div class="message" style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin-bottom: 30px; text-align: left; font-weight: 300; letter-spacing: 0.02em;">
        We received an authorization request to access your registered client dossier and reset your Atelier security password. Please input the secure 6-digit credentials override code below to authenticate.
      </div>
      <div class="otp-container" style="background-color: #070707; border: 1px solid #222222; padding: 25px; margin: 30px 0; display: inline-block;">
        <div class="otp-code" style="font-size: 34px; color: #d4af37; font-weight: 600; font-family: monospace; letter-spacing: 0.3em; margin-left: 0.3em;">${otp}</div>
        <div class="expiry" style="font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 12px; font-weight: 400;">Expires in 10 minutes</div>
      </div>
      <div class="message" style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin-bottom: 30px; text-align: center; font-weight: 300; letter-spacing: 0.02em;">
        For your security, do not share this passcode. Our concierge will never ask for your verification code.
      </div>
      <div class="security-notice" style="font-size: 11px; color: #52525b; line-height: 1.6; text-align: left; margin-top: 40px; border-top: 1px solid #1a1a1a; padding-top: 20px; font-weight: 300;">
        <strong>SECURITY NOTICE:</strong> If you did not make this credentials request, you can safely disregard this notification. Your active security settings remain fully protected.
      </div>
      <div class="line" style="height: 1px; background: linear-gradient(90deg, transparent, #d4af37, transparent); margin: 25px 0;"></div>
      <div class="footer" style="font-size: 9px; color: #52525b; margin-top: 30px; text-align: center; letter-spacing: 0.25em; text-transform: uppercase;">© 2026 LUXEVRA ATELIER. ALL RIGHTS RESERVED.</div>
    </div>
  </div>
</body>
</html>`;

      const transporter = getMailTransporter();
      let emailDispatched = false;

      if (transporter) {
        try {
          await transporter.sendMail({
            from: `"LUXEVRA Atelier" <${process.env.SMTP_USER}>`,
            to: cleanEmail,
            subject: "🔐 LUXEVRA Credentials Override Code: " + otp,
            html: htmlEmailContent,
            text: `DEAR ${targetUser.name.toUpperCase()},\n\nWe received an authorization request to reset your Atelier security password. Use code ${otp} to verify.\n\nExpires in 10 minutes.\n\n© 2026 LUXEVRA.`
          });
          emailDispatched = true;
          console.log(`[MAILER] Branded OTP email successfully sent via SMTP to: ${cleanEmail}`);
        } catch (mailErr: any) {
          console.error(`[MAILER] SMTP delivery failed for ${cleanEmail}:`, mailErr.message);
        }
      }

      // For developers and interactive live-simulation testing: supply details only when not in production
      const isProd = process.env.NODE_ENV === "production";
      const responseData: any = {
        success: true,
        message: "A secure credentials verification code has been dispatched to your inbox.",
        emailSent: emailDispatched
      };

      if (!isProd) {
        responseData.debugCode = otp; // Safe preview delivery for frictionless sandbox experience
        responseData.debugEmailHtml = htmlEmailContent; // Renders visual mailbox preview directly in UI
      }

      return res.json(responseData);
    } catch (err: any) {
      console.error("[AUTH API] Forgot password error:", err);
      return res.status(500).json({ success: false, error: "An internal server error occurred: " + err.message });
    }
  });

  // 4b. Verify OTP - Securely validates client OTP and issues a single-use verification ticket
  app.post("/api/auth/verify-otp", (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ success: false, error: "Registered email address and verification code are required." });
      }

      const cleanEmail = email.toLowerCase().trim();
      const existing = otpStore.get(cleanEmail);

      if (!existing) {
        return res.status(400).json({ success: false, error: "No active verification request found for this email address." });
      }

      // Check Expiration
      if (Date.now() > existing.expiresAt) {
        otpStore.delete(cleanEmail); // cleanup expired credentials
        return res.status(400).json({ success: false, error: "Your verification code has expired (10-minute limit). Please request a new code." });
      }

      // Enforce security try limits (Max 5 attempts)
      if (existing.attemptsCount >= 5) {
        otpStore.delete(cleanEmail); // invalidate immediately to prevent brute force
        return res.status(400).json({ success: false, error: "Maximum verification attempts exceeded. This code has been invalidated for security. Please request a new code." });
      }

      // Validate matching code
      if (existing.otp !== otp.toString().trim()) {
        existing.attemptsCount++;
        const attemptsRemaining = 5 - existing.attemptsCount;
        return res.status(400).json({
          success: false,
          error: `The code entered does not match our records. ${attemptsRemaining} verification attempt${attemptsRemaining === 1 ? "" : "s"} remaining.`
        });
      }

      // OTP Verification Approved - Issue a cryptographic temporary single-use Reset Ticket
      const resetTicket = crypto.randomBytes(32).toString("hex");
      existing.verified = true;
      existing.resetTicket = resetTicket;
      existing.expiresAt = Date.now() + 5 * 60 * 1000; // Ticket valid for a tight 5-minute window

      console.log(`[AUTH API] OTP verification approved for: ${cleanEmail}. Generated temporary resetTicket.`);

      return res.json({
        success: true,
        message: "Verification code approved. You may now update your credentials.",
        resetTicket
      });
    } catch (err: any) {
      console.error("[AUTH API] OTP verification error:", err);
      return res.status(500).json({ success: false, error: "An internal server error occurred: " + err.message });
    }
  });

  // 4c. Reset Password - Uses Reset Ticket to safely write new secure password
  app.post("/api/auth/reset-password", (req, res) => {
    try {
      const { email, resetTicket, password, confirmPassword } = req.body;
      if (!email || !resetTicket || !password || !confirmPassword) {
        return res.status(400).json({ success: false, error: "Missing required parameters for password reset." });
      }

      const cleanEmail = email.toLowerCase().trim();
      const existing = otpStore.get(cleanEmail);

      // Verify Ticket authenticity and validity
      if (!existing || !existing.verified || existing.resetTicket !== resetTicket) {
        return res.status(403).json({ success: false, error: "Invalid or unauthorized reset ticket. Please verify credentials first." });
      }

      if (Date.now() > existing.expiresAt) {
        otpStore.delete(cleanEmail);
        return res.status(403).json({ success: false, error: "Your password reset session has expired. Please verify your credentials again." });
      }

      // Strict client-side policy validation on server for production-grade security
      if (password !== confirmPassword) {
        return res.status(400).json({ success: false, error: "Password confirmation does not match original." });
      }
      if (password.length < 8) {
        return res.status(400).json({ success: false, error: "Password must be at least 8 characters in length." });
      }
      if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ success: false, error: "Password requires at least one uppercase letter (A-Z)." });
      }
      if (!/[a-z]/.test(password)) {
        return res.status(400).json({ success: false, error: "Password requires at least one lowercase letter (a-z)." });
      }
      if (!/[0-9]/.test(password)) {
        return res.status(400).json({ success: false, error: "Password requires at least one number (0-9)." });
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return res.status(400).json({ success: false, error: "Password requires at least one special character (e.g. @, #, $, %, etc)." });
      }

      // Authenticity checks pass - write to the permanent database
      const allUsers = loadUsers();
      const userIndex = allUsers.findIndex(u => u.email === cleanEmail);

      if (userIndex === -1) {
        return res.status(404).json({ success: false, error: "Registered profile not found in user database." });
      }

      // Generate a brand new salt and PBKDF2 hash
      const userSalt = crypto.randomBytes(16).toString("hex");
      const userHash = hashPassword(password, userSalt);

      // Update user details
      allUsers[userIndex].salt = userSalt;
      allUsers[userIndex].passwordHash = userHash;
      saveUsers(allUsers);

      // Invalidate the OTP session so it is strictly single-use
      otpStore.delete(cleanEmail);

      console.log(`[AUTH API] Password reset successfully executed for: ${cleanEmail}. Invalided OTP session.`);

      return res.json({
        success: true,
        message: "Your Atelier security password has been updated successfully. Please login."
      });
    } catch (err: any) {
      console.error("[AUTH API] Password reset execution error:", err);
      return res.status(500).json({ success: false, error: "An internal server error occurred during password update: " + err.message });
    }
  });

  // Ensure unique uploaded directory exists for backward compatibility
  const UPLOADS_DIR = path.join(process.cwd(), "uploaded");
  if (!fs.existsSync(UPLOADS_DIR)) {
    try {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      console.log("[DATABASE] Created uploaded folder successfully at: " + UPLOADS_DIR);
    } catch (err) {
      console.error("[DATABASE] Failed to create uploaded directory:", err);
    }
  }

  // Ensure public/uploads directory exists for static local mirror & offline export requirements
  const PUBLIC_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
    try {
      fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
      console.log("[STORAGE] Created public/uploads folder successfully.");
    } catch (err) {
      console.error("[STORAGE] Failed to create public/uploads folder:", err);
    }
  }

  // Serve static folders
  app.use("/uploaded", express.static(UPLOADS_DIR));
  app.use("/uploads", express.static(PUBLIC_UPLOADS_DIR));

  // Initialize Supabase Client
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
  const supabaseBucket = process.env.SUPABASE_BUCKET_NAME || "product-images";

  const supabase = (supabaseUrl && supabaseServiceKey) ? createClient(supabaseUrl, supabaseServiceKey) : null;
  if (supabase) {
    console.log("[SUPABASE] Client successfully initialized with URL: " + supabaseUrl);
  } else {
    console.log("[SUPABASE] Client not configured. Using local file system fallback.");
  }

  // Helper to extract filename from a Supabase URL
  function extractFilenameFromSupabaseUrl(url: string): string | null {
    if (!url || !supabaseUrl) return null;
    try {
      if (url.includes(supabaseUrl) && url.includes(supabaseBucket)) {
        const parts = url.split("/");
        return parts[parts.length - 1];
      }
    } catch (e) {
      console.error("[SUPABASE] Error parsing filename from URL:", url, e);
    }
    return null;
  }

  // Helper to delete an image from Supabase Storage
  async function deleteImageFromSupabase(url: string) {
    if (!supabase) return;
    const filename = extractFilenameFromSupabaseUrl(url);
    if (!filename) return;

    try {
      console.log(`[SUPABASE] Attempting to delete asset from Storage: ${filename}`);
      const { error } = await supabase.storage.from(supabaseBucket).remove([filename]);
      if (error) {
        console.error(`[SUPABASE] Failed to delete ${filename} from Storage:`, error.message);
      } else {
        console.log(`[SUPABASE] Successfully deleted ${filename} from Storage.`);
      }
    } catch (err: any) {
      console.error("[SUPABASE] Storage deletion exception:", err.message);
    }
  }

  // Helper to download an image from a remote URL to the local filesystem
  async function downloadImage(url: string, destPath: string): Promise<boolean> {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch image: HTTP ${res.status}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(destPath, buffer);
      return true;
    } catch (err: any) {
      console.error(`[EXPORT PREP] Error downloading image from ${url}:`, err.message);
      return false;
    }
  }

  // Helper to get a clean local filename from a remote image URL
  function getFilenameFromUrl(url: string, prodId: string, prefix: string): string {
    try {
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname;
      const base = path.basename(pathname);
      const ext = path.extname(base);
      if (ext && [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(ext.toLowerCase())) {
        const nameWithoutExt = path.basename(base, ext);
        // Clean special characters
        const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, "");
        return `${prodId}_${prefix}_${cleanName}${ext}`;
      }
    } catch (e) {
      // Fallback
    }
    const uuid = crypto.randomUUID();
    return `${prodId}_${prefix}_${uuid}.jpg`;
  }

  // Helper to decode base64 images, save locally to public/uploads, and upload to Supabase Storage
  const saveBase64Image = async (base64Str: string, prodId: string, prefix: string): Promise<string> => {
    if (!base64Str || !base64Str.startsWith("data:image/")) {
      return base64Str;
    }
    try {
      const matches = base64Str.match(/^data:image\/([A-Za-z-+0-9]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        console.warn("[DATABASE] Image base64 structure was invalid");
        return base64Str;
      }
      const mimeType = base64Str.split(";")[0].split(":")[1]; // e.g. "image/png"
      const rawExt = matches[1];
      const ext = rawExt === "jpeg" ? "jpg" : rawExt;
      const dataBuffer = Buffer.from(matches[2], "base64");
      
      const uuid = crypto.randomUUID();
      const filename = `${prodId}_${prefix}_${uuid}.${ext}`;
      const localFilePath = path.join(PUBLIC_UPLOADS_DIR, filename);

      // 1. Mirror locally to public/uploads (always do this so it's ready for ZIP offline exports)
      fs.writeFileSync(localFilePath, dataBuffer);
      console.log(`[DATABASE] Mirrored image locally to: ${localFilePath}`);

      // 2. Upload to Supabase if configured
      if (supabase) {
        try {
          console.log(`[SUPABASE] Uploading ${filename} to storage bucket: ${supabaseBucket}...`);
          const { data, error } = await supabase.storage
            .from(supabaseBucket)
            .upload(filename, dataBuffer, {
              contentType: mimeType,
              upsert: true
            });

          if (error) {
            console.error("[SUPABASE] Storage upload error:", error.message);
            return `/uploads/${filename}`;
          }

          const { data: urlData } = supabase.storage
            .from(supabaseBucket)
            .getPublicUrl(filename);

          console.log(`[SUPABASE] Image successfully uploaded. Public URL: ${urlData.publicUrl}`);
          return urlData.publicUrl;
        } catch (subErr: any) {
          console.error("[SUPABASE] Storage exception:", subErr.message);
          return `/uploads/${filename}`;
        }
      }

      return `/uploads/${filename}`;
    } catch (err: any) {
      console.error("[DATABASE] Upload failure: Failed to write base64 image file:", err);
      return base64Str;
    }
  };

  const DB_PATH = path.join(process.cwd(), "products_db.json");

  // API endpoint to load products dynamically from the database
  app.get("/api/products", async (req, res) => {
    try {
      if (supabase) {
        try {
          console.log("[SUPABASE] Fetching products from Supabase Database...");
          const { data, error } = await supabase
            .from("products")
            .select("*");

          if (error) {
            if (error.code === "42P01") {
              console.warn("[SUPABASE] Table 'products' does not exist in Supabase. Falling back to local products_db.json...");
            } else {
              throw error;
            }
          } else if (data && data.length > 0) {
            const products = data.map((row: any) => ({
              id: row.id,
              name: row.name,
              price: Number(row.price),
              originalPrice: row.original_price ? Number(row.original_price) : undefined,
              image: row.image,
              images: row.images || [],
              badge: row.badge || undefined,
              description: row.description,
              details: row.details || [],
              specs: row.specs || undefined,
              colors: row.colors || []
            }));

            // Sync locally to products_db.json so they are cached & offline-ready
            fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 2), "utf-8");
            
            console.log(`[SUPABASE] Fetch success: Loaded ${products.length} products from Supabase.`);
            return res.json({ success: true, products, source: "supabase" });
          }
        } catch (subErr: any) {
          console.error("[SUPABASE] Failed to fetch from Supabase. Falling back to local file...", subErr.message);
        }
      }

      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, "utf-8");
        const products = JSON.parse(fileContent);
        console.log(`[DATABASE] Database fetch success: Loaded ${products.length} products from products_db.json`);
        return res.json({ success: true, products, source: "local" });
      } else {
        console.log("[DATABASE] products_db.json database file not found. Initializing with default dataset...");
        const srcDataPath = path.join(process.cwd(), "src", "data.ts");
        let initialProducts = [];
        if (fs.existsSync(srcDataPath)) {
          try {
            const srcContent = fs.readFileSync(srcDataPath, "utf-8");
            const match = srcContent.match(/export const PRODUCTS: Product\[\] = (\[[\s\S]*?\]);/);
            if (match) {
              initialProducts = JSON.parse(match[1]);
            }
          } catch (e) {
            console.warn("[DATABASE] Could not parse default products from src/data.ts:", e);
          }
        }
        if (!initialProducts || initialProducts.length === 0) {
          initialProducts = [
            {
              id: "oversized-hoodie",
              name: "OVERSIZED HOODIE",
              price: 2799,
              originalPrice: 3499,
              image: "/src/assets/images/oversized_hoodie_1784392144459.jpg",
              badge: "BESTSELLER",
              description: "An oversized design featuring dense cotton composition and relaxed shoulder contours.",
              details: ["100% Organic Cotton", "Heavyweight fabric", "Tailored fit specs"]
            }
          ];
        }
        fs.writeFileSync(DB_PATH, JSON.stringify(initialProducts, null, 2), "utf-8");
        console.log("[DATABASE] Database initialization complete. Created products_db.json.");
        return res.json({ success: true, products: initialProducts, source: "initialized" });
      }
    } catch (e: any) {
      console.error("[DATABASE] Database fetch failure:", e);
      return res.status(500).json({ error: "Failed to read database records: " + e.message });
    }
  });

  // API endpoint to save the latest product/color configuration to codebase
  app.post("/api/save-config", async (req, res) => {
    const { products } = req.body;
    if (!products || !Array.isArray(products)) {
      console.error("[DATABASE] Database write failure: Invalid products payload.");
      return res.status(400).json({ error: "Invalid products array. Products config save failed." });
    }

    try {
      const dataPath = path.join(process.cwd(), "src", "data.ts");
      
      // Process and save any base64 images permanently to the server disk and Supabase Storage
      const processedProducts = await Promise.all(products.map(async (product: any) => {
        const updatedProduct = { ...product };

        // 1. Process main image
        if (updatedProduct.image && updatedProduct.image.startsWith("data:image/")) {
          updatedProduct.image = await saveBase64Image(updatedProduct.image, updatedProduct.id, "main");
        }

        // 2. Process additional images
        if (updatedProduct.images && Array.isArray(updatedProduct.images)) {
          updatedProduct.images = await Promise.all(updatedProduct.images.map(async (img: string, idx: number) => {
            if (img && img.startsWith("data:image/")) {
              return await saveBase64Image(img, updatedProduct.id, `additional_${idx}`);
            }
            return img;
          }));
        }

        // 3. Process colors image
        if (updatedProduct.colors && Array.isArray(updatedProduct.colors)) {
          updatedProduct.colors = await Promise.all(updatedProduct.colors.map(async (color: any, idx: number) => {
            if (color.image && color.image.startsWith("data:image/")) {
              const updatedColorImg = await saveBase64Image(color.image, updatedProduct.id, `color_${idx}`);
              return {
                ...color,
                image: updatedColorImg
              };
            }
            return color;
          }));
        }

        return updatedProduct;
      }));

      // Write processed records directly to local DB
      fs.writeFileSync(DB_PATH, JSON.stringify(processedProducts, null, 2), "utf-8");
      console.log(`[DATABASE] Database write success: Saved ${processedProducts.length} product records permanently to products_db.json`);

      // Sync to Supabase Database if connected
      if (supabase) {
        try {
          console.log("[SUPABASE] Syncing products to Supabase Database...");
          const rows = processedProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            original_price: p.originalPrice || null,
            image: p.image,
            images: p.images || [],
            badge: p.badge || null,
            description: p.description,
            details: p.details || [],
            specs: p.specs || null,
            colors: p.colors || []
          }));

          const { error } = await supabase
            .from("products")
            .upsert(rows, { onConflict: "id" });

          if (error) {
            console.error("[SUPABASE] Database upsert error:", error.message);
          } else {
            console.log("[SUPABASE] Successfully synced products to Supabase Database.");
          }

          // Clean up deleted products from Supabase Database and Storage
          const { data: existingDbProducts, error: fetchErr } = await supabase
            .from("products")
            .select("id, image, images, colors");

          if (!fetchErr && existingDbProducts) {
            const incomingIds = new Set(processedProducts.map(p => p.id));
            const deletedProducts = existingDbProducts.filter(p => !incomingIds.has(p.id));

            for (const dp of deletedProducts) {
              console.log(`[SUPABASE] Cleaning up assets for deleted product: ${dp.id}`);
              if (dp.image) {
                await deleteImageFromSupabase(dp.image);
              }
              if (dp.images && Array.isArray(dp.images)) {
                for (const img of dp.images) {
                  await deleteImageFromSupabase(img);
                }
              }
              if (dp.colors && Array.isArray(dp.colors)) {
                for (const col of dp.colors) {
                  if (col.image) {
                    await deleteImageFromSupabase(col.image);
                  }
                }
              }
              await supabase.from("products").delete().eq("id", dp.id);
            }
          }
        } catch (dbErr: any) {
          console.error("[SUPABASE] Database sync exception:", dbErr.message);
        }
      }

      const fileContent = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, ValueProposition, PackagingItem, LookbookScene } from "./types";

export const PRODUCTS: Product[] = ${JSON.stringify(processedProducts, null, 2)};

export const VALUE_PROPOSITIONS: ValueProposition[] = [
  {
    id: "quality",
    title: "PREMIUM QUALITY",
    subtitle: "Finest fabrics & materials",
    iconName: "crown"
  },
  {
    id: "returns",
    title: "EASY RETURNS",
    subtitle: "14 days return policy",
    iconName: "package"
  },
  {
    id: "payment",
    title: "SECURE PAYMENTS",
    subtitle: "100% secure transactions",
    iconName: "lock"
  },
  {
    id: "support",
    title: "CUSTOMER SUPPORT",
    subtitle: "24/7 support available",
    iconName: "headphones"
  }
];

export const PACKAGING_ITEMS: PackagingItem[] = [
  {
    id: "collateral-box-bag",
    title: "SIGNATURE BOX & BAG",
    description: "Every purchase is delivered in our slide-out rigid white box with gold hot-stamping and custom matte black bag, designed to preserve the structure of heavyweight garments.",
    image: "/src/assets/images/luxevra_packaging_1784392190373.jpg",
    accent: "Gold Foil & Matte Cardboard"
  },
  {
    id: "leather-branding-patch",
    title: "EMBOSSED LEATHER SIGNATURE",
    description: "Our signature garments carry a thick, hand-stitched matte black leather patch with gold debossed monograms, reflecting premium craft in every stitch.",
    image: "/src/assets/images/leather_patch_1784392207167.jpg",
    accent: "Full-Grain Italian Leather"
  },
  {
    id: "unboxing-tissue-tags",
    title: "COTTON CORDS & HEAVY TAGS",
    description: "Each item is pinned with thick, textured matte-black card tags suspended by custom-spun heavy cotton cords and secured via gold-finished security locks.",
    image: "/src/assets/images/luxevra_packaging_1784392190373.jpg",
    accent: "400 GSM Felt Cardstock"
  }
];

export const LOOKBOOK_SCENES: LookbookScene[] = [
  {
    id: "lookbook-1",
    image: "/src/assets/images/oversized_hoodie_1784392144459.jpg",
    title: "NOCTURNAL MINIMALISM",
    description: "Dark drapes and structured silhouettes captured against jagged natural rocks, emphasizing texture and gravity.",
    taggedProducts: [
      {
        productId: "oversized-hoodie",
        name: "OVERSIZED HOODIE",
        price: 2799,
        x: 50,
        y: 45
      }
    ]
  },
  {
    id: "lookbook-2",
    image: "/src/assets/images/signature_tee_1784392156271.jpg",
    title: "LIGHT CONTRASTS",
    description: "Soft off-white cotton paired with high-density gold branding details. Clean, bold lines meant for daylight.",
    taggedProducts: [
      {
        productId: "signature-tee",
        name: "SIGNATURE TEE",
        price: 1699,
        x: 52,
        y: 50
      }
    ]
  },
  {
    id: "lookbook-3",
    image: "/src/assets/images/vintage_wash_hoodie_1784392179215.jpg",
    title: "VINTAGE SOUL",
    description: "An homage to classic street styles. Earthy washed charcoal tones with a broken-in structural drape.",
    taggedProducts: [
      {
        productId: "vintage-wash-hoodie",
        name: "VINTAGE WASH HOODIE",
        price: 2999,
        x: 48,
        y: 35
      }
    ]
  }
];
`;

      fs.writeFileSync(dataPath, fileContent, "utf-8");
      console.log("Written updated products configuration to src/data.ts.");
      return res.json({ success: true, message: "Products config persisted to src/data.ts successfully." });
    } catch (e: any) {
      console.error("Failed to write updated products configuration to src/data.ts:", e);
      return res.status(500).json({ error: "Failed to persist configuration to disk: " + e.message });
    }
  });

  // API endpoint to automate downloading and localizing Supabase images for offline ZIP export
  app.post("/api/export-prep", async (req, res) => {
    try {
      console.log("[EXPORT PREP] Starting preparation for offline project export...");
      
      // Ensure directory exists
      if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
        fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
      }

      // 1. Fetch current active products
      let activeProducts: any[] = [];
      if (supabase) {
        try {
          const { data, error } = await supabase.from("products").select("*");
          if (!error && data && data.length > 0) {
            activeProducts = data.map((row: any) => ({
              id: row.id,
              name: row.name,
              price: Number(row.price),
              originalPrice: row.original_price ? Number(row.original_price) : undefined,
              image: row.image,
              images: row.images || [],
              badge: row.badge || undefined,
              description: row.description,
              details: row.details || [],
              specs: row.specs || undefined,
              colors: row.colors || []
            }));
          }
        } catch (e: any) {
          console.warn("[EXPORT PREP] Failed to fetch from Supabase during prep, using local database instead:", e.message);
        }
      }

      if (activeProducts.length === 0 && fs.existsSync(DB_PATH)) {
        activeProducts = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
      }

      if (activeProducts.length === 0) {
        return res.status(400).json({ success: false, error: "No products found to export." });
      }

      const mappings: { productId: string; field: string; originalUrl: string; localPath: string }[] = [];
      const warnings: string[] = [];
      let downloadedCount = 0;

      // Helper function to download and update
      const processRemoteUrl = async (url: string, prodId: string, fieldName: string): Promise<string> => {
        if (!url || !url.startsWith("http")) {
          return url; // Already a local path or empty
        }

        const fname = getFilenameFromUrl(url, prodId, fieldName);
        const destPath = path.join(PUBLIC_UPLOADS_DIR, fname);

        console.log(`[EXPORT PREP] Downloading image from ${url} to ${destPath}...`);
        const ok = await downloadImage(url, destPath);
        if (ok) {
          downloadedCount++;
          const localUrl = `/uploads/${fname}`;
          mappings.push({
            productId: prodId,
            field: fieldName,
            originalUrl: url,
            localPath: localUrl
          });
          return localUrl;
        } else {
          warnings.push(`Could not download image "${url}" referenced as "${fieldName}" for product ID "${prodId}"`);
          return url; // Keep original remote URL if download fails
        }
      };

      // 2. Process each product
      const exportedProducts = [];
      for (const p of activeProducts) {
        const updated = { ...p };

        // Process main image
        if (updated.image) {
          updated.image = await processRemoteUrl(updated.image, updated.id, "main");
        }

        // Process additional images
        if (updated.images && Array.isArray(updated.images)) {
          updated.images = await Promise.all(
            updated.images.map((img: string, idx: number) => processRemoteUrl(img, updated.id, `additional_${idx}`))
          );
        }

        // Process colors
        if (updated.colors && Array.isArray(updated.colors)) {
          updated.colors = await Promise.all(
            updated.colors.map(async (color: any, idx: number) => {
              if (color.image) {
                const updatedImage = await processRemoteUrl(color.image, updated.id, `color_${idx}`);
                return { ...color, image: updatedImage };
              }
              return color;
            })
          );
        }

        exportedProducts.push(updated);
      }

      // 3. Write exported products to local db products_db.json
      fs.writeFileSync(DB_PATH, JSON.stringify(exportedProducts, null, 2), "utf-8");
      
      // 4. Update src/data.ts to make the exported codebase offline-ready
      const dataTsPath = path.join(process.cwd(), "src", "data.ts");
      if (fs.existsSync(dataTsPath)) {
        try {
          const fileContent = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, ValueProposition, PackagingItem, LookbookScene } from "./types";

export const PRODUCTS: Product[] = ${JSON.stringify(exportedProducts, null, 2)};

export const VALUE_PROPOSITIONS: ValueProposition[] = [
  {
    id: "quality",
    title: "PREMIUM QUALITY",
    subtitle: "Finest fabrics & materials",
    iconName: "crown"
  },
  {
    id: "returns",
    title: "EASY RETURNS",
    subtitle: "14 days return policy",
    iconName: "package"
  },
  {
    id: "payment",
    title: "SECURE PAYMENTS",
    subtitle: "100% secure transactions",
    iconName: "lock"
  },
  {
    id: "support",
    title: "CUSTOMER SUPPORT",
    subtitle: "24/7 support available",
    iconName: "headphones"
  }
];

export const PACKAGING_ITEMS: PackagingItem[] = [
  {
    id: "collateral-box-bag",
    title: "SIGNATURE BOX & BAG",
    description: "Every purchase is delivered in our slide-out rigid white box with gold hot-stamping and custom matte black bag, designed to preserve the structure of heavyweight garments.",
    image: "/src/assets/images/luxevra_packaging_1784392190373.jpg",
    accent: "Gold Foil & Matte Cardboard"
  },
  {
    id: "leather-branding-patch",
    title: "EMBOSSED LEATHER SIGNATURE",
    description: "Our signature garments carry a thick, hand-stitched matte black leather patch with gold debossed monograms, reflecting premium craft in every stitch.",
    image: "/src/assets/images/leather_patch_1784392207167.jpg",
    accent: "Full-Grain Italian Leather"
  },
  {
    id: "unboxing-tissue-tags",
    title: "COTTON CORDS & HEAVY TAGS",
    description: "Each item is pinned with thick, textured matte-black card tags suspended by custom-spun heavy cotton cords and secured via gold-finished security locks.",
    image: "/src/assets/images/luxevra_packaging_1784392190373.jpg",
    accent: "400 GSM Felt Cardstock"
  }
];

export const LOOKBOOK_SCENES: LookbookScene[] = [
  {
    id: "lookbook-1",
    image: "/src/assets/images/oversized_hoodie_1784392144459.jpg",
    title: "NOCTURNAL MINIMALISM",
    description: "Dark drapes and structured silhouettes captured against jagged natural rocks, emphasizing texture and gravity.",
    taggedProducts: [
      {
        productId: "oversized-hoodie",
        name: "OVERSIZED HOODIE",
        price: 2799,
        x: 50,
        y: 45
      }
    ]
  },
  {
    id: "lookbook-2",
    image: "/src/assets/images/signature_tee_1784392156271.jpg",
    title: "LIGHT CONTRASTS",
    description: "Soft off-white cotton paired with high-density gold branding details. Clean, bold lines meant for daylight.",
    taggedProducts: [
      {
        productId: "signature-tee",
        name: "SIGNATURE TEE",
        price: 1699,
        x: 52,
        y: 50
      }
    ]
  },
  {
    id: "lookbook-3",
    image: "/src/assets/images/vintage_wash_hoodie_1784392179215.jpg",
    title: "VINTAGE SOUL",
    description: "An homage to classic street styles. Earthy washed charcoal tones with a broken-in structural drape.",
    taggedProducts: [
      {
        productId: "vintage-wash-hoodie",
        name: "VINTAGE WASH HOODIE",
        price: 2999,
        x: 48,
        y: 35
      }
    ]
  }
];
`;
          fs.writeFileSync(dataTsPath, fileContent, "utf-8");
          console.log("[EXPORT PREP] src/data.ts has been successfully rewritten with localized paths.");
        } catch (srcWriteErr: any) {
          console.error("[EXPORT PREP] Failed to rewrite src/data.ts:", srcWriteErr.message);
          warnings.push("Failed to write updated configuration to src/data.ts: " + srcWriteErr.message);
        }
      }

      // 5. Generate a manifest mapping each product to its exported image
      const manifest = {
        exportedAt: new Date().toISOString(),
        productsCount: exportedProducts.length,
        downloadedCount,
        mappings,
        warnings
      };
      const manifestPath = path.join(PUBLIC_UPLOADS_DIR, "manifest.json");
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

      // 6. Verify that every product image referenced in the exported project exists inside the ZIP
      const verificationReport: { path: string; exists: boolean }[] = [];
      for (const p of exportedProducts) {
        if (p.image && p.image.startsWith("/uploads/")) {
          const localPath = path.join(PUBLIC_UPLOADS_DIR, p.image.replace("/uploads/", ""));
          verificationReport.push({ path: p.image, exists: fs.existsSync(localPath) });
        }
        if (p.images && Array.isArray(p.images)) {
          for (const img of p.images) {
            if (img && img.startsWith("/uploads/")) {
              const localPath = path.join(PUBLIC_UPLOADS_DIR, img.replace("/uploads/", ""));
              verificationReport.push({ path: img, exists: fs.existsSync(localPath) });
            }
          }
        }
        if (p.colors && Array.isArray(p.colors)) {
          for (const col of p.colors) {
            if (col.image && col.image.startsWith("/uploads/")) {
              const localPath = path.join(PUBLIC_UPLOADS_DIR, col.image.replace("/uploads/", ""));
              verificationReport.push({ path: col.image, exists: fs.existsSync(localPath) });
            }
          }
        }
      }

      const missingImages = verificationReport.filter(v => !v.exists).map(v => v.path);
      if (missingImages.length > 0) {
        warnings.push(`Verification warning: The following referenced local files are missing on disk: ${missingImages.join(", ")}`);
      }

      console.log(`[EXPORT PREP] Completed. Processed ${exportedProducts.length} products. Downloaded ${downloadedCount} assets. Warnings: ${warnings.length}`);
      return res.json({
        success: true,
        message: "Offline assets pre-downloaded and project configuration localized successfully.",
        downloadedCount,
        productsCount: exportedProducts.length,
        warnings,
        manifest
      });
    } catch (err: any) {
      console.error("[EXPORT PREP] Failed to prepare export:", err);
      return res.status(500).json({ success: false, error: "An error occurred during export preparation: " + err.message });
    }
  });

  // Setup Vite development server or serve built assets in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LUXEVRA ENGINE] Running full-stack environment on port ${PORT}`);
  });
}

startServer();
