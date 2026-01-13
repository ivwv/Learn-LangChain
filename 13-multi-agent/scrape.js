// scrape.js - 使用 fetch 抓取网页内容
export async function scrapeReact(url) {
  if (!url) return "NO_URL";

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    
    if (!res.ok) {
      return `SCRAPE_ERROR: HTTP ${res.status}`;
    }
    
    const html = await res.text();
    
    // 清理 HTML，提取纯文本
    const content = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);
    
    return content;
  } catch (err) {
    return `SCRAPE_ERROR: ${err.message}`;
  }
}
