const request = require("request");
const { JSDOM } = require("jsdom");
const nodeMailer = require("nodemailer");
const mysql = require("mysql");
const cron = require("node-cron");

//mysqlに接続
var con = mysql.createConnection({
  host: "database-score.c3idtfkpwxpj.ap-northeast-1.rds.amazonaws.com",
  user: "tkm",
  password: "oiho3456ddf",
  database: "mail_db",
});

//userの情報を取得
mysql_get_user = function () {
  //promise実装
  return new Promise(function (resolve, reject) {
    //mysqlから値を取得
    con.query("SELECT username, email from name_mail", function (err, result) {
      if (err) {
        reject(new Error("Error rows in undefined"));
      } else {
        //余計なものを削除してjson形式にする
        const results_json = JSON.stringify(result);
        //json形式からobjectに変換
        const results_json_parse = JSON.parse(results_json);
        resolve(results_json_parse);
      }
    });
  });
};

// スクレイピングを行いサイトからTOP10を取得
get_top10 = function () {
  return new Promise(function (resolve, reject) {
    //urlのランキングサイトからランキングを取得
    request(
      "https://djtube.jp/ranking/jp_hiphop_single_daily/",
      (e, response, body) => {
        if (e) {
          reject(new Error("Error rows in undefined"));
        }
        try {
          const dom = new JSDOM(body);
          //タイトルの取得
          const latestDate = dom.window.document.querySelectorAll(
            ".rankingItem__title"
          );
          //配列に変換
          const latestDate_array = Array.from(latestDate);
          //１〜１０位までを取得
          const latestDate_top10_array = latestDate_array.slice(0, 10);
          resolve(latestDate_top10_array);
        } catch (e) {
          console.error(e);
        }
      }
    );
  });
};

//mailの送信など
function sendMail(smtpData, mailData) {
  //smtpサーバーの情報をまとめる
  const transporter = nodeMailer.createTransport(smtpData);

  //mail送信
  transporter.sendMail(mailData, function (error, info) {
    if (error) {
      //エラー処理
      console.log(error);
    } else {
      //送信時処理
      console.log("Email sent: " + info.response);
    }
  });
}

//朝７時に定期実行
cron.schedule("0 0 7 * * *", () =>
  get_top10()
    .then(function (results) {
      //取得したタイトルをtop10まで追加
      let music_top10_word = "";
      for (let i = 0; i < results.length; i++) {
        music_top10_word += `${i + 1}位： ${results[i].textContent}\n`;
      }

      function main(subject, email) {
        //SMTP情報を格納(Gmailの場合)
        const smtpData = {
          host: "smtp.gmail.com",
          port: "465",
          secure: true,
          auth: {
            user: "dkgi345sd90@gmail.com",
            pass: "dij345iois",
          },
        };
        const mailData = {
          from: '"テストユーザ" <' + smtpData.auth.user + " >",
          to: email,
          subject: `${subject}様へ`,
          text: music_top10_word,
        };
        sendMail(smtpData, mailData);
      }
      //メールアドレスを登録した方全員にmailを送る
      mysql_get_user()
        .then(function (results) {
          //resultには登録されているメールと名前の配列が入っている
          for (let i = 0; i < results.length; i++) {
            main(results[i].username, results[i].email);
          }
        })
        .catch(function () {
          console.log("Promise rejection error!" + err);
        });
    })
    .catch(function () {
      console.log("Promise rejection error: ");
    })
);
