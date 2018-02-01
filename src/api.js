const thrift = require('thrift-http');
const unirest = require('unirest');
const qrcode = require('qrcode-terminal');
const util = require("util");
const mime = require("mime");
const fs = require('fs');
const path = require('path');

const LineService = require('../curve-thrift/LineService');
const {
  LoginResultType,
  IdentityProvider,
  ContentType,
  Message,
  LoginRequest
} = require('../curve-thrift/line_types');

const PinVerifier = require('./pinVerifier');
var config = require('./config');
var moment = require('moment');
var reqx = new LoginRequest();
var reqxy = new LoginRequest();

function isImg(param) {
  return imgArr.includes(param);
}


class LineAPI {
  constructor() {
    this.config = config;
    this.setTHttpClient();
    this.axz = false;
    this.axy = false;
  }

  setTHttpClient(options = {
    protocol: thrift.TCompactProtocol,
    transport: thrift.TBufferedTransport,
    headers: this.config.Headers,
    path: this.config.LINE_HTTP_URL,
    https: true
    }) {

    //options.headers['X-Line-Application'] = 'CHROMEOS\x092.0.0\x09Chrome_OS\x091';
    //options.headers['X-Line-Application'] = 'DESKTOPMAC 10.10.2-YOSEMITE-x64    MAC 4.5.0';
    options.headers['X-Line-Application'] = 'DESKTOPWIN 7.18.1 YOGS 11.2.5';  
    //options.headers['X-Line-Application'] = 'IOSIPAD\t7.14.0\tiPhone_OS\t10.12.0';
    this.options = options;
    this.connection =
      thrift.createHttpConnection(this.config.LINE_DOMAIN_4TH, 443, this.options);
    this.connection.on('error', (err) => {
      console.log('err', err);
      return err;
    });
    if (this.axz === true) {
      this._channel = thrift.createHttpClient(LineService, this.connection);
      this.axz = false;
    } else if (this.axy === true) {
      this._authService = thrift.createHttpClient(LineService, this.connection);
      this.axy = false;
    } else {
      this._client = thrift.createHttpClient(LineService, this.connection);
    }

  }

  async _chanConn() {
    this.options.headers['X-Line-Access'] = this.config.tokenn;
    this.options.path = this.config.LINE_CHANNEL_PATH;
    this.axz = true;
    this.setTHttpClient(this.options);
    return Promise.resolve();
  }

  async _authConn() {
    this.axy = true;
    this.options.path = this.config.LINE_RS;
    this.setTHttpClient(this.options);
    return Promise.resolve();
  }

  async _tokenLogin(authToken, certificate) {
    this.options.path = this.config.LINE_COMMAND_PATH;
    this.config.Headers['X-Line-Access'] = authToken;
    config.tokenn = authToken;
    this.setTHttpClient(this.options);
    return Promise.resolve({
      authToken,
      certificate
    });
  }

  async _qrCodeLogin() {
    this.setTHttpClient();
    return new Promise((resolve, reject) => {
      this._client.getAuthQrcode(true, 'Self_bot', (err, result) => {
        const qrcodeUrl = `line://au/q/${result.verifier}`;
        qrcode.generate(qrcodeUrl, {
          small: true
        });
        console.info(`\n\nlink qr code is: ${qrcodeUrl}`)
        Object.assign(this.config.Headers, {
          'X-Line-Access': result.verifier
        });
        unirest.get('https://gd2.line.naver.jp/Q')
          .headers(this.config.Headers)
          .timeout(120000)
          .end(async(res) => {
            const verifiedQr = res.body.result.verifier;
            this._authConn();
            reqx.type = 1;
            reqx.verifier = verifiedQr;
            this._authService.loginZ(reqx, (err, success) => {
              config.tokenn = success.authToken;
              config.certificate = success.certificate;
              const authToken = config.tokenn;
              const certificate = config.certificate;
              this.options.headers['X-Line-Access'] = config.tokenn;
              this.options.path = this.config.LINE_COMMAND_PATH;
              this.setTHttpClient(this.options);
              //this.options.headers['User-Agent'] = 'Mozilla/5.0 AppleWebKit/537.36 Chrome/63.0.3239.108 Safari/537.36';    
              this.options.headers['User-Agent'] = 'Android Mobile Line/7.18.1';
              this.axz = true;
              this.setTHttpClient(this.options);
              this.axz = false;
              resolve({
                authToken,
                certificate,
                verifiedQr
              });
            })
          });
      });
    });
  }

  async _xlogin(id, password) {
    const pinVerifier = new PinVerifier(id, password);
    return new Promise((resolve, reject) => (
      this._setProvider(id).then(() => {
        this.setTHttpClient();
        this._getRSAKeyInfo(this.provider, (key, credentials) => {
          this.options.path = this.config.LINE_RS;
          this.setTHttpClient(this.options);
          const rsaCrypto = pinVerifier.getRSACrypto(credentials);
          reqx.type = 0;
          reqx.identityProvider = this.provider;
          reqx.identifier = rsaCrypto.keyname;
          reqx.password = rsaCrypto.credentials;
          reqx.keepLoggedIn = true;
          reqx.accessLocation = this.config.ip;
          reqx.systemName = 'IPAD';
          reqx.e2eeVersion = 0;
          try {
            this._client.loginZ(reqx,
              (err, success) => {
                if (err) {
                  console.log('\n\n');
                  console.error("=> " + err.reason);
                  process.exit();
                }
                this.options.path = this.config.LINE_COMMAND_PATH;
                this.setTHttpClient(this.options);
                this._authConn();
                this._client.pinCode = success.pinCode;
                console.info("\n\n=============================\nEnter This Pincode => " + success.pinCode + "\nto your mobile phone in 2 minutes\n=============================");
                this._checkLoginResultType(success.type, success);
                reqxy.type = 1;
                this._loginWithVerifier((verifierResult) => {
                  this.options.path = this.config.LINE_COMMAND_PATH;
                  this.setTHttpClient(this.options);
                  config.tokenn = verifierResult.authToken;
                  this._checkLoginResultType(verifierResult.type, verifierResult);
                  resolve(verifierResult);
                });
              });
          } catch (error) {
            console.log('error');
            console.log(error);
          }
        })
      })
    ));
  }

  async _loginWithVerifier(callback) {
    let retx = await this.getJson(this.config.LINE_CERTIFICATE_URL)
    reqxy.verifier = retx.result.verifier;
    this._authService.loginZ(reqxy, (err, success) => {
      callback(success);
    })
  }

  async _setProvider(id) {
    this.provider = this.config.EMAIL_REGEX.test(id) ?
      IdentityProvider.LINE :
      IdentityProvider.NAVER_KR;

    return this.provider === IdentityProvider.LINE ?
      this.getJson(this.config.LINE_SESSION_LINE_URL) :
      this.getJson(this.config.LINE_SESSION_NAVER_URL);
  }

  async _checkLoginResultType(type, result) {
    this.config.Headers['X-Line-Access'] = result.authToken || result.verifier;
    if (result.type === LoginResultType.SUCCESS) {
      this.certificate = result.certificate;
      this.authToken = result.authToken;
    } else if (result.type === LoginResultType.REQUIRE_QRCODE) {
      console.log('require QR code');
    } else if (result.type === LoginResultType.REQUIRE_DEVICE_CONFIRM) {
      console.log('require device confirm');
    } else {
      throw new Error('unkown type');
    }
    return result;
  }

  async _sendMessage(message, txt, seq = 0) {
    message.text = txt;
    return this._client.sendMessage(0, message);
  }

  async _sendChatChecked(consumer, lastMessageId, seq = 0) {
    return this._client.sendChatChecked(seq, consumer, lastMessageId);
  }

  async _kickMember(group, memid) {
    return this._client.kickoutFromGroup(0, group, memid);
  }

  async _cancel(groupid, member) {
    return this._client.cancelGroupInvitation(0, groupid, member);
  }

  async _getGroupsJoined() {
    return await this._client.getGroupIdsJoined()
  }

  async _myProfile() {
    return await this._client.getProfile();
  }

  async _getGroupsInvited() {
    return await this._client.getGroupIdsInvited()
  }

  async _acceptGroupInvitation(groupid) {
    this._client.acceptGroupInvitation(0, groupid);
    await this._getGroupsInvited();
    await this._getGroupsJoined();
    return;
  }

  async _inviteIntoGroup(group, memid) {
    return this._client.inviteIntoGroup(0, group, memid);
  }

  async _invite(group, member) {
    return this._client.inviteIntoGroup(0, group, member)
  }

  async _updateGroup(group) {
    return await this._client.updateGroup(0, group)
  }

  async _updateProfile(profile) {
    return await this._client.updateProfile(0, profile)
  }

  async _updateProfileAttribute(attr, hash_id){
    return this._client.updateProfileAttribute(0, attr, hash_id);
  }

  async _getContacts(mid) {
    return this._client.getContacts(mid)
  }

  async _getProfile(mid) {
    return this._client.getProfile(mid);
  }

  async _getGroups(groupId) {
    return await this._client.getGroups(groupId);
  }

  async _getGroup(groupId) {
    return await this._client.getGroup(groupId);
  }

  async _getAllContactIds() {
    return await this._client.getAllContactIds();
  }

  async _getRoom(roomId) {
    return await this._client.getRoom(roomId);
  }

  async _reissueGroupTicket(groupId) {
    return await this._client.reissueGroupTicket(groupId);
  }

  async _findGroupByTicket(ticketID) {
    return await this._client.findGroupByTicket(ticketID);
  }

  async _acceptGroupInvitationByTicket(gid, ticketID) {
    return await this._client.acceptGroupInvitationByTicket(0, gid, ticketID);
  }

  async _getRSAKeyInfo(provider, callback) {
    let result = await this._client.getRSAKeyInfo(provider);
    callback(result.keynm, result);
  }

  async _fsUnlinkFile(extF, filepaths) {
    fs.unlinkSync(filepaths);
  }

  async _getServerTime(timestamp) {
    let formatted = moment("/Date(" + timestamp + "-0700)/").toString();
    return formatted;
  }

  async _sendImageWithURL(to, urls, extF, filepaths) {
    if (isImg(extF)) {
      this._sendFile(to, filepaths, 1);
    } else {
      let aM = new Message();
      aM.to = to;
      aM.text = "Gagal, ekstensi file tidak diperbolehkan !";
      this._client.sendMessage(0, aM);
    }
  }

  async _timeParse(secondx) {
    let sec_num = parseInt(secondx, 10); // don't forget the second param
    let days = Math.floor(sec_num / 86400);
    let hours = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (days < 10) {
      days = "0" + days;
    }
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    return hours + ' Hours ' + minutes + ' Minutes ' + seconds + ' Seconds';
  }

  async _sendFile(message, filepaths, typeContent = 1) {
    let filename = 'media';
    let typeFile;

    switch (typeContent) {
      case 2:
        typeFile = 'video'
        break;
      case 3:
        typeFile = 'audio'
        break;
      default:
        typeFile = 'image'
        break;
    }

    let M = new Message();
    M.to = message.to;
    M.contentType = typeContent;
    M.contentPreview = null;
    M.contentMetadata = null;


    const filepath = path.resolve(filepaths)
    fs.readFile(filepath, async(err, bufs) => {
      let imgID = await this._client.sendMessage(0, M);
      const data = {
        params: JSON.stringify({
          name: filename,
          oid: imgID.id,
          size: bufs.length,
          type: typeFile,
          ver: '1.0'
        })
      };
      return this
        .postContent(config.LINE_POST_CONTENT_URL, data, filepath)
        .then((res) => {
          if (res.err) {
            console.log('err', res.error)
            return;
          }
          if (filepath.search(/download\//g) === -1) {
            fs.unlink(filepath, (err) => {
              if (err) {
                console.log('err on upload', err);
                return err
              };
            });
          }

        });
    });
  }

  async _sendImage(to, filepaths) {
    this._sendFile(to, filepaths, 1);
  }

  async _isoToDate(param, callback) {
    let xdate = new Date(param);
    let xyear = xdate.getFullYear();
    let xmonth = xdate.getMonth() + 1;
    let xdt = xdate.getDate();

    if (xdt < 10) {
      xdt = '0' + xdt;
    }
    if (xmonth < 10) {
      xmonth = '0' + xmonth;
    }

    callback(xyear + '-' + xmonth + '-' + xdt);
  }

  async _base64Image(src, callback) {
    let datax = fs.readFileSync(src).toString("base64");
    let cx = util.format("data:%s;base64,%s", mime.lookup(src), datax);
    callback(cx);
  }

  async _getImageFromLine(oid, callback) {
    //console.info(oid);console.info(this.config.Headers);
    unirest.get("https://obs-sg.line-apps.com/talk/m/download.nhn?oid=" + oid + "&tid=original")
      .headers(
        this.config.Headers
      )
      .timeout(120000)
      .end((res) => (
        res.error ? callback(res.error) : callback(res.body)
      ))
  }

  async _download(uri, name, type, callback) {
    let formatType;
    switch (type) {
      case 3:
        formatType = 'm4a';
        break;
      default:
        formatType = 'jpg';
        break;
    }
    let dir = __dirname + this.config.FILE_DOWNLOAD_LOCATION;
    if (!fs.existsSync(dir)) {
      await fs.mkdirSync(dir);
    }
    await unirest
      .get(uri)
      .headers({
        ...this.config.Headers
      })
      .end((res) => {
        if (res.error) {
          console.log(res.error);
          return 'err';
        }
      }).pipe(fs.createWriteStream(`${dir}/${name}.${formatType}`)).on('finish', function () {
        callback(dir + name + "." + formatType);
      });;
    //callback(dir+name+"."+formatType);
  }

  async postContent(url, data = null, filepath = null) {
    return new Promise((resolve, reject) => (
      unirest.post(url)
      .headers({
        ...this.config.Headers,
        'Content-Type': 'multipart/form-data'
      })
      .timeout(120000)
      .field(data)
      .attach('files', filepath)
      .end((res) => {
        res.error ? reject(res.error) : resolve(res)
      })
    ));
  }

  async _newPost(ctoken, text){
    let bot = await this._client.getProfile();
    let optionx = {
      method: 'POST',
      uri: this.gdLine + '/mh/api/v24/post/create.json',
      body: {
        postInfo: { "readPermission" : { "type": "ALL" } },
        sourceType: "TIMELINE",
        contents: { "text": text}
      },
      headers: {
        "Content-Type": "application/json",
        "X-Line-Mid": bot.mid,
        "x-lct": ctoken,
        "User-Agent": "Line/7.14.0"
      },
      json: true
    };
    await rp(optionx)
      .then(function (parsedBody) {
        //console.info(parsedBody);
      })
      .catch(function (err) {
        //console.info(err);
      });
  }

  async _fetchOperations(revision, count) {
    // this.options.path = this.config.LINE_POLL_URL
    return this._client.fetchOperations(revision, count);
  }

  async _fetchOps(revision, count = 0) {
    return this._client.fetchOps(revision, count, 0, 0);
  }

  async getJson(path, headerx) {
    return new Promise((resolve, reject) => (
      unirest.get(`https://${this.config.LINE_DOMAIN}${path}`)
      .headers(this.config.Headers)
      .timeout(120000)
      .end((res) => (
        res.error ? reject(res.error) : resolve(res.body)
      ))
    ));
  }

  async _xgetJson(uri, path, callback) {
    return new Promise((resolve, reject) => (
      unirest.get(`${uri}${path}`)
      .timeout(120000)
      .end((res) => (
        res.error ? callback(res.error) : callback(res.body)
      ))
    ));
  }
}

module.exports = LineAPI;