function LoginOTPEmail(otp) {
    return `<!DOCTYPE html>
      <html lang="en">
  
  
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <style type="text/css">
              body {
                  padding: 0px;
                  font-size: 14px;
              }
  
  
              .logo img {
                  width: 35px;
              }
  
  
              .fullbody {
                  margin: 10px;
                  background-color: white;
                  padding: 15px;
                  border-radius: 5px;
                  height: fit-content;
                  border: 1px solid #e8e8e8;
              }
  
  
              .body a {
                  text-decoration: none;
                  font-weight: bold;
                  color: #00a0e3;
              }
  
  
              .body span {
                  font-weight: bold;
              }
  
  
              .otp {
                  text-align: center;
              }
  
  
              .otp span {
                  padding: 20px 60px;
                  font-size: 30px;
                  text-align: center;
                  /* border: 1px solid #e8e8e8; */
                  width: fit-content;
                  border-radius: 5px;
                  display: flex;
                  margin: auto;
              }
  
  
              .body p {
                  text-align: left;
              }
          </style>
      </head>
  
  
      <body>
          <div class="fullbody">
              <div class="logo"><img src="https://www.swiftfolios.com/static-content/assets/images/swiftfolios-logo.png"></div>
              <div class="body">
                  <div class="otp">Login OTP<br><span>${otp}</span></div>
                  <p><br>Note: Please Do NOT share this OTP with anyone else. Also if you have received this email in
                      error, kindly ignore and also please let us know. Thanks!
                      <br>
                  </p>
  
  
              </div>
              <div class="bottom"></div>
          </div>
      </body>
  
  
      </html>`;
  }
  
  
  module.exports = { LoginOTPEmail };