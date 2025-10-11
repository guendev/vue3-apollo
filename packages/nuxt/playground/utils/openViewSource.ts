export async function openViewSource(url: string) {
    try {
        const response = await fetch(url)
        const html = await response.text()

        // Tạo HTML formatted để hiển thị source
        const formattedHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>View Source - SSR</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #1e1e1e;
            color: #d4d4d4;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 14px;
            line-height: 1.6;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .header {
            position: sticky;
            top: 0;
            background: #252526;
            padding: 10px 20px;
            margin: -20px -20px 20px -20px;
            border-bottom: 1px solid #3e3e42;
            font-weight: bold;
            color: #4ec9b0;
        }
    </style>
</head>
<body>
    <div class="header">🔍 SSR Source Code - ${url}</div>
    <pre>${html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`

        const blob = new Blob([formattedHtml], { type: 'text/html' })
        const blobUrl = URL.createObjectURL(blob)
        window.open(blobUrl, '_blank')
    }
    catch (error) {
        console.error('Failed to fetch source:', error)
    }
}
