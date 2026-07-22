const fs = require('fs');

function replaceColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Mass class replacements for luxury feel in JS template literals
  const replacements = [
    // Backgrounds
    [/bg-zinc-950/g, 'bg-black'],
    [/bg-zinc-900\/60/g, 'bg-[#0a0a0a]'],
    [/bg-zinc-900\/40/g, 'bg-[#0a0a0a]'],
    [/bg-zinc-900/g, 'bg-[#0a0a0a]'],
    [/bg-zinc-800/g, 'bg-[#111111]'],
    [/bg-amber-500\/10/g, 'bg-brand-gold/10'],
    [/bg-amber-500\/20/g, 'bg-brand-gold/10'],
    [/bg-amber-500/g, 'bg-brand-gold'],
    [/bg-amber-400/g, 'bg-brand-gold'],
    
    // Borders
    [/border-zinc-900/g, 'border-[#1a1a1a]'],
    [/border-zinc-800/g, 'border-[#1a1a1a]'],
    [/border-amber-500\/20/g, 'border-brand-gold/20'],
    [/border-amber-500\/30/g, 'border-brand-gold/20'],
    [/border-amber-500\/40/g, 'border-brand-gold/30'],
    [/border-amber-500\/50/g, 'border-brand-gold/40'],
    [/border-amber-400/g, 'border-brand-gold'],
    [/border-amber-500/g, 'border-brand-gold'],
    
    // Text colors
    [/text-zinc-100/g, 'text-white'],
    [/text-zinc-200/g, 'text-white'],
    [/text-zinc-300/g, 'text-[#cccccc]'],
    [/text-zinc-400/g, 'text-[#888888]'],
    [/text-zinc-500/g, 'text-[#666666]'],
    [/text-zinc-600/g, 'text-[#444444]'],
    [/text-amber-200/g, 'text-brand-gold-light'],
    [/text-amber-300/g, 'text-brand-gold'],
    [/text-amber-400/g, 'text-brand-gold'],
    [/text-amber-500/g, 'text-brand-gold-dark'],
    [/text-emerald-400/g, 'text-white'],
    
    // Gradients
    [/from-zinc-950/g, 'from-black'],
    [/via-amber-950\/40/g, 'via-brand-gold/10'],
    [/to-zinc-950/g, 'to-black'],
    
    // Shadow / Rounded
    [/rounded-2xl/g, 'rounded-none'],
    [/rounded-xl/g, 'rounded-sm'],
    [/rounded-lg/g, 'rounded-sm'],
    [/rounded-md/g, 'rounded-sm'],
    [/ rounded /g, ' rounded-none '],
    [/"rounded /g, '"rounded-none '],
    [/ rounded"/g, ' rounded-none"'],
    
    // Hover states
    [/hover:bg-amber-500/g, 'hover:bg-brand-gold'],
    [/hover:text-amber-300/g, 'hover:text-brand-gold-light'],
    [/hover:text-amber-400/g, 'hover:text-brand-gold-light'],
    [/hover:border-amber-500\/40/g, 'hover:border-brand-gold/50'],
    [/hover:border-amber-500\/30/g, 'hover:border-brand-gold/40'],
    [/hover:border-amber-400/g, 'hover:border-brand-gold'],
    
    // Fonts
    [/font-black/g, 'font-medium'],
    [/font-extrabold/g, 'font-medium'],
    [/font-bold/g, 'font-normal']
  ];

  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }
  
  // Specific replacements in JS: product cards
  content = content.replace(/group relative bg-\[#0a0a0a\] border border-\[#1a1a1a\]/g, 'group relative bg-[#0a0a0a] border border-[#1a1a1a] product-card-hover');
  
  fs.writeFileSync(filePath, content);
}

replaceColors('assets/js/main.js');
console.log('Colors replaced in main.js');
