#!/usr/bin/env node
/**
 * translate_html_site.js
 *
 * Recursively translates HTML files in a local directory using Google Translate.
 * Uses cheerio for HTML parsing and native fetch for direct translation requests.
 *
 * Requirements:
 *     npm install cheerio
 *
 * Usage:
 *     node translate_html_site.js --src <source_dir> --dest <dest_dir> --target en
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Check requirement and load cheerio safely
let cheerio;
try {
    cheerio = require('cheerio');
} catch (e) {
    console.error("Error: 'cheerio' is required. Install it using: npm install cheerio\n");
    process.exit(1);
}

/**
 * Free Google Translate API helper using native fetch
 */
async function translateText(text, sourceLang, targetLang) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
    }
    
    const data = await response.json();
    try {
        // Google Translate returns an array of parts. Join them for long texts.
        return data[0].map(part => part[0]).join('');
    } catch (err) {
        return text;
    }
}

/**
 * Recursively extracts visible text nodes from Cheerio's DOM tree,
 * skipping scripts, styles, code blocks, and headers.
 */
function findTextNodes(node, elements = []) {
    if (!node) return elements;
    
    const ignoredTags = ['script', 'style', 'head', 'meta', 'link', 'code', 'pre'];
    if (node.type === 'tag' && ignoredTags.includes(node.name.toLowerCase())) {
        return elements;
    }
    
    if (node.type === 'text') {
        elements.push(node);
    } else if (node.children) {
        for (const child of node.children) {
            findTextNodes(child, elements);
        }
    }
    return elements;
}

/**
 * Translates a single HTML file and outputs the translated content to destPath
 */
async function translateHtmlFile(filePath, destPath, sourceLang, targetLang) {
    console.log(`Processing: ${filePath}`);
    
    try {
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(htmlContent);
        
        // Retrieve all text nodes
        const rootNode = $.root()[0];
        const textNodes = findTextNodes(rootNode);
        
        let successCount = 0;
        let failCount = 0;
        
        for (const node of textNodes) {
            const originalText = node.data;
            const trimmed = originalText.trim();
            
            // Only translate substantial strings
            if (trimmed && trimmed.length > 1 && isNaN(trimmed)) {
                try {
                    const translated = await translateText(trimmed, sourceLang, targetLang);
                    if (translated) {
                        // Preserve original formatting, padding, and spacing
                        const leadingSpaces = originalText.length - originalText.trimStart().length;
                        const trailingSpaces = originalText.length - originalText.trimEnd().length;
                        
                        node.data = ' '.repeat(leadingSpaces) + translated + ' '.repeat(trailingSpaces);
                        successCount++;
                    }
                } catch (err) {
                    failCount++;
                    if (failCount <= 5) {
                        console.warn(`  [Warning] Failed to translate: "${trimmed.slice(0, 25)}..." (${err.message})`);
                    } else if (failCount === 6) {
                        console.warn("  [Warning] Additional translation warnings suppressed...");
                    }
                }
            }
        }
        
        // Specifically translate the title tag if present
        const titleTag = $('title');
        if (titleTag.length > 0) {
            const titleText = titleTag.text().trim();
            if (titleText && isNaN(titleText)) {
                try {
                    const translatedTitle = await translateText(titleText, sourceLang, targetLang);
                    if (translatedTitle) {
                        titleTag.text(translatedTitle);
                    }
                } catch (err) {
                    // Suppress title translate errors
                }
            }
        }
        
        // Save the translated file
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, $.html(), 'utf8');
        
        console.log(`  [Success] Saved to ${destPath} (Translated nodes: ${successCount})`);
        
    } catch (err) {
        console.error(`  [Error] Failed to process file ${filePath}:`, err);
    }
}

/**
 * Find all files recursively in a directory
 */
function walkDirectory(dir, filterFn, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDirectory(filePath, filterFn, fileList);
        } else if (filterFn(filePath)) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

/**
 * Ask user for console input confirmation
 */
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

/**
 * Parse Command Line Arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const params = {
        src: null,
        dest: null,
        target: 'en',
        source: 'auto'
    };
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--src' || args[i] === '-s') {
            params.src = args[++i];
        } else if (args[i] === '--dest' || args[i] === '-d') {
            params.dest = args[++i];
        } else if (args[i] === '--target' || args[i] === '-t') {
            params.target = args[++i];
        } else if (args[i] === '--source' || args[i] === '--source-lang' || args[i] === '-l') {
            params.source = args[++i];
        } else if (args[i] === '--help' || args[i] === '-h') {
            console.log(`
Google Translate HTML offline site.
Usage:
  node translate_html_site.js -s <source_dir> -d <dest_dir> [options]

Options:
  -s, --src PATH           Source directory containing HTML files
  -d, --dest PATH          Destination directory to write translated files
  -t, --target LANG        Target language code (default: en)
  -l, --source-lang LANG   Source language code (default: auto)
            `);
            process.exit(0);
        }
    }
    
    return params;
}

async function main() {
    const params = parseArgs();
    
    if (!params.src || !params.dest) {
        console.error("Error: --src (-s) and --dest (-d) are required. Run with --help for details.");
        process.exit(1);
    }
    
    const srcDir = path.resolve(params.src);
    const destDir = path.resolve(params.dest);
    
    if (!fs.existsSync(srcDir) || !fs.statSync(srcDir).isDirectory()) {
        console.error(`Error: Source directory '${srcDir}' does not exist.`);
        process.exit(1);
    }
    
    if (srcDir === destDir) {
        console.warn("Warning: Source and destination directories are identical.");
        const answer = await askQuestion("Are you sure you want to translate in-place and overwrite files? (y/N): ");
        if (answer.toLowerCase() !== 'y') {
            console.log("Operation aborted.");
            process.exit(0);
        }
    }
    
    console.log("============================================================");
    console.log("Starting Offline Site Translation (Node.js)");
    console.log(`Source Directory : ${srcDir}`);
    console.log(`Dest Directory   : ${destDir}`);
    console.log(`Target Language  : ${params.target}`);
    console.log(`Source Language  : ${params.source}`);
    console.log("============================================================");
    
    // Find all HTML files
    const htmlFiles = walkDirectory(srcDir, (filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        return ext === '.html' || ext === '.htm';
    });
    
    if (htmlFiles.length === 0) {
        console.log("No HTML files found in the source directory.");
        process.exit(0);
    }
    
    console.log(`Found ${htmlFiles.length} HTML files to translate.\n`);
    
    for (const filePath of htmlFiles) {
        const relPath = path.relative(srcDir, filePath);
        const destPath = path.join(destDir, relPath);
        
        await translateHtmlFile(filePath, destPath, params.source, params.target);
    }
    
    console.log("\nSite translation task completed successfully!");
}

main();
