export function getConfirmationEmailHtml(code) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Confirmação de Anúncio</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f9f9f9;
            padding: 20px;
          }
          .container {
            background: #ffffff;
            border-radius: 8px;
            padding: 24px;
            max-width: 600px;
            margin: auto;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }
          .code {
            background-color: #f0f0f0;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            letter-spacing: 2px;
            margin: 24px 0;
            color: #2c3e50;
          }
          .footer {
            font-size: 14px;
            color: #777;
            margin-top: 32px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Confirmação de Anúncio</h2>
          <p>Olá! 🎵</p>
          <p>Recebemos o seu anúncio em <strong>Muito Além do Microfone</strong>.</p>
          <p>Para confirmá-lo, utilize o código abaixo:</p>
          <div class="code">${code}</div>
          <p>Este código é válido por <strong>30 minutos</strong>.</p>
          <p>Se você não solicitou este anúncio, pode ignorar este e-mail.</p>
          <div class="footer">
            Equipe Muito Além do Microfone<br />
            🎤 A música te conecta.
          </div>
        </div>
      </body>
    </html>
  `;
}
