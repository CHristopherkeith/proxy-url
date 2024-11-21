const express = require("express");
const axios = require("axios");

const app = express();

app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send("Missing 'url' parameter");
  }
  if (!/^https?:\/\//.test(targetUrl)) {
    return res.status(400).send("Invalid URL protocol");
  }

  const getAcceptHeader = (url) => {
    if (url.endsWith(".css")) return "text/css";
    if (url.endsWith(".js")) return "application/javascript";
    return "*/*";
  };

  try {
    // 代理请求
    const response = await axios.get(targetUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Accept: getAcceptHeader(targetUrl),
        Referer: targetUrl, // 模拟来源
        // Referer: new URL(targetUrl).origin
      },
    });
    // console.log('[debug response.headers]', response.headers)
    // 转发响应头和内容
    res.set("Referrer-Policy", "no-referrer");
    res.set({
      "Content-Type": response.headers["content-type"],
      "Access-Control-Allow-Origin": "*",
    });
    // let htmlContent = response.data.toString();
    // htmlContent = htmlContent.replace(
    //   /<link\s+[^>]*href=["']([^"']+)["']/g,
    //   (match, group) => match.replace(group, `${targetUrl}${group}`)
    // );
    // htmlContent = htmlContent.replace(
    //   /<script\s+[^>]*src=["']([^"']+)["']/g,
    //   (match, group) => match.replace(group, `${targetUrl}${group}`)
    // );
    // res.send(htmlContent);
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.status(500).send("Proxy request failed");
  }
});

// 启动代理服务
app.listen(80, () => {
  console.log("Proxy server is running on http://localhost");
});
