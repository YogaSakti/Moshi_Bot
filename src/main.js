const LineAPI = require('./api');
const request = require('request');
const fs = require('fs');
const unirest = require('unirest');
const webp = require('webp-converter');
const path = require('path');
const rp = require('request-promise');
const config = require('./config');
const {
	Message,
	OpType,
	Location
} = require('../curve-thrift/line_types');
//let exec = require('child_process').exec;

const myBot = ['u05ca28fb987817ad9fb186583ff2634b', 'u602da153a8b0095217d2fcd9c89a1a92']; //'u32830ece1a56f2a5a1943bc4e58e116f'
const banList = []; //Banned list
var groupList = new Array(); //Group list
var vx = {};
var midnornama, pesane, kickhim;
var waitMsg = "no"; //DO NOT CHANGE THIS
var bcText = "Masukan teks untuk broadcast";

function isAdminOrBot(param) {
	return myBot.includes(param);
}

function isBanned(banList, param) {
	return banList.includes(param);
}

function firstToUpperCase(str) {
	return str.substr(0, 1).toUpperCase() + str.substr(1);
}


class LINE extends LineAPI {
	constructor() {
		super();
		this.receiverID = '';
		this.checkReader = [];
		this.stateStatus = {
			autojoin: 1, //0 = No, 1 = Yes
			cancel: 0, //0 = Auto cancel off, 1 = on
			kick: 0, //1 = Yes, 0 = No
			mute: 0, //1 = Mute, 0 = Unmute
			protect: 1, //Protect Kicker
			qr: 1, //0 = Gk boleh, 1 = Boleh
			salam: 1, //1 = Yes, 0 = No
			chat: 1 //1 = Yes, 0 = No
		}
		this.keyhelp = "[Keyword Bot]\n\
key / Help	=> List command\n\
Myid		=> your id\n\
Ginfo		=> info grup\n\
Ourl		=> open grup url\n\
Curl		=> close grup url\n\
Tag all		=> tag all grup member\n\
Sider		=> menu sider\n\
Time		=> time\n\
Speed		=> cek bot speed\n\
Bot info	=> contact bot\n\
Bot stat	=> view bot status\n\
Bot left	=> bot leave";

		var that = this;
	}
	/*
	====================\n\n\
	========Admin========\n\
	!mute\n\
	!unmute\n\
	!grouputil\n\
	!broadcast\n\
	!refresh\n\
	!cancel\n\
	!ban\n\
	!unban\n\
	!kickban\n\
	!kickall\n\

	.msg  => Pc ke orang\n\
	.tts => convert text to speech\n\
	=> !kepo\n\
	=> !cekid\n\
	=> !banlist\n\
	=> !cancel\n\
	=> !animesearch\n\
	=> !sms\n\
	=> !curl\n\
	=> !getimage\n\
	=> !yousound\n\
	=> !youtube\n
	=> !addcontact *ADMIN*\n\
	=> !adminutil *ADMIN*\n\
	=> !ban *ADMIN*\n\
	=> !unban *ADMIN*\n\
	=> !kickban *ADMIN*\n\
	*/

	getOprationType(operations) {
		for (let key in OpType) {
			if (operations.type == OpType[key]) {
				if (key !== 'NOTIFIED_UPDATE_PROFILE') {
					console.info(`[ ${operations.type} ] ${key} `);
				}
			}
		}
	}

	poll(operation) {
		if (operation.type == 25 || operation.type == 26) {
			const txt = (operation.message.text !== '' && operation.message.text != null) ? operation.message.text : '';
			let message = new Message(operation.message);
			this.receiverID = message.to = (operation.message.to === myBot[0]) ? operation.message.from_ : operation.message.to;
			Object.assign(message, {
				ct: operation.createdTime.toString()
			});
			if (waitMsg == "yes" && operation.message.from_ == vx[0] && this.stateStatus.mute != 1) {
				this.textMessage(txt, message, message.text)
			} else if (this.stateStatus.mute != 1) {
				this.textMessage(txt, message);
			} else if (txt == "!unmute" && this.stateStatus.mute == 1 && isAdminOrBot(operation.message.from_)) {
				this.stateStatus.mute = 0;
				this._sendMessage(message, "ヽ(^。^)ノ")
			} else {
				console.info("muted");
			}
		}

		if (operation.type == 13 && this.stateStatus.cancel == 1 && !isAdminOrBot(operation.param2)) { //someone inviting..
			this.cancelAll(operation.param1);
		}

		if (operation.type == 100 || operation.type == 101 || operation.type == 102 || operation.type == 103 || operation.type == 104 || operation.type == 105 || operation.type == 106 || operation.type == 107 || operation.type == 108 || operation.type == 109 || operation.type == 110 || operation.type == 111 || operation.type == 112 || operation.type == 113 || operation.type == 114 || operation.type == 115 || operation.type == 116 || operation.type == 117 || operation.type == 118 || operation.type == 119 || operation.type == 120 || operation.type == 121 || operation.type == 122 || operation.type == 123 || operation.type == 124 || operation.type == 125 || operation.type == 126 || operation.type == 127 || operation.type == 128 || operation.type == 129 || operation.type == 130 || operation.type == 131 || operation.type == 132 || operation.type == 133 || operation.type == 134 || operation.type == 135 || operation.type == 136 || operation.type == 137 || operation.type == 138 || operation.type == 139 || operation.type == 140 || operation.type == 141 || operation.type == 142 || operation.type == 143 || operation.type == 144 || operation.type == 145 || operation.type == 146 || operation.type == 147 || operation.type == 148 || operation.type == 149 || operation.type == 150) {
			console.info(operation);
		}

		if (operation.type == 16 && this.stateStatus.salam == 1) { //join group
			let halo = new Message();
			halo.to = operation.param1;
			halo.text = "Hi, SalKen ^_^\nketik help untuk menu bot.";
			this._client.sendMessage(0, halo);
		}

		if (operation.type == 17 && this.stateStatus.salam == 1 && isAdminOrBot(operation.param2)) { //ada yang join
			let halobos = new Message();
			halobos.to = operation.param1;
			halobos.toType = 2;
			halobos.text = "Selamat datang :D";
			this._client.sendMessage(0, halobos);
		} else if (operation.type == 17 && this.stateStatus.salam == 1) { //ada yang join
			let seq = new Message();
			seq.to = operation.param1;
			this.textMessage("0101", seq, operation.param2, 1);
		}

		if (operation.type == 15) { //ada yang leave // && isAdminOrBot(operation.param2)
			let babay = new Message();
			babay.to = operation.param1;
			babay.toType = 2;
			babay.text = "Goodbye 😢";
			//this._invite(operation.param1,[operation.param2]);
			this._client.sendMessage(0, babay);
		}

		if (operation.type == 5 && this.stateStatus.salam == 1) { //someone adding me..
			let halo = new Message();
			halo.to = operation.param1;
			halo.text = "Hi! thanks for add ^_^";
			this._client.sendMessage(0, halo);
		}

		if (operation.type == 19 && this.stateStatus.protect == 1) { //ada kick && !isAdminOrBot(operation.param2)
			// op1 = group nya
			let op1 = operation.param1;
			// op2 = yang 'nge' kick
			let op2 = operation.param2;
			// op3 = yang 'di' kick
			let op3 = operation.param3;
			if (isAdminOrBot(op2)) {
				console.info("KICK by admin");
			} else if (isAdminOrBot(op3)) {
				this._invite(op1, [op3]);
				console.info("KICK (other)");
				var kickhim = 'yes';
			} else {
				this._invite(op1, [op3]);
				console.info("admin/bot di kick");
				var kickhim = 'yes';
			}
			if (kickhim == 'yes') {
				this._kickMember(op1, [op2]);

			}

		}

		if (operation.type == 11 && this.stateStatus.qr == 0) {
			let seq = new Message();
			seq.to = operation.param1;
			this.textMessage("0103", seq, operation.param2, 1);
		} else if (operation.type == 11 && this.stateStatus.qr == 1) {
			let seq = new Message();
			seq.to = operation.param1;
			this.textMessage("0104", seq, operation.param2, 1);
		}


		if (operation.type == 55) { //ada reader

			const idx = this.checkReader.findIndex((v) => {
				if (v.group == operation.param1) {
					return v
				}
			})
			if (this.checkReader.length < 1 || idx == -1) {
				this.checkReader.push({
					group: operation.param1,
					users: [operation.param2],
					timeSeen: [operation.param3]
				});
			} else {
				for (var i = 0; i < this.checkReader.length; i++) {
					if (this.checkReader[i].group == operation.param1) {
						if (!this.checkReader[i].users.includes(operation.param2)) {
							this.checkReader[i].users.push(operation.param2);
							this.checkReader[i].timeSeen.push(operation.param3);
						}
					}
				}
			}
		}

		if (operation.type == 13) { // diinvite
			if (this.stateStatus.autojoin == 1 || isAdminOrBot(operation.param2)) {
				return this._acceptGroupInvitation(operation.param1);
			} else {
				return this._cancel(operation.param1, operation.param2);
			}
		}
		this.getOprationType(operation);
	}

	async cancelAll(gid) {
		let {
			listPendingInvite
		} = await this.searchGroup(gid);
		if (listPendingInvite.length > 0) {
			this._cancel(gid, listPendingInvite);
		}
	}

	async searchGroup(gid) {
		let listPendingInvite = [];
		let thisgroup = await this._getGroups([gid]);
		if (thisgroup[0].invitee !== null) {
			listPendingInvite = thisgroup[0].invitee.map((key) => {
				return key.mid;
			});
		}
		let listMember = thisgroup[0].members.map((key) => {
			return {
				mid: key.mid,
				dn: key.displayName
			};
		});

		return {
			listMember,
			listPendingInvite
		}
	}

	async matchPeople(param, nama) { //match name
		for (var i = 0; i < param.length; i++) {
			let orangnya = await this._client.getContacts([param[i]]);
			if (orangnya[0].displayName == nama) {
				return orangnya;
				break;
			}
		}
	}

	async isInGroup(param, mid) {
		let {
			listMember
		} = await this.searchGroup(param);
		for (var i = 0; i < listMember.length; i++) {
			if (listMember[i].mid == mid) {
				return listMember[i].mid;
				break;
			}
		}
	}

	async searchRoom(rid) {
		let thisroom = await this._getRoom(rid);
		let listMemberr = thisroom.contacts.map((key) => {
			return {
				mid: key.mid,
				dn: key.displayName
			};
		});

		return {
			listMemberr
		}
	}

	setState(seq, param) {
		if (param == 1) {
			let isinya = "Status: \n";
			for (var k in this.stateStatus) {
				if (typeof this.stateStatus[k] !== 'function') {
					if (this.stateStatus[k] == 1) {
						isinya += "▷" + firstToUpperCase(k) + " ⇒ on\n";
					} else {
						isinya += "▷" + firstToUpperCase(k) + " ⇒ off\n";
					}
				}
			}
			this._sendMessage(seq, isinya);
		} else {
			if (isAdminOrBot(seq.from_)) {
				let [actions, status] = seq.text.split(' ');
				const action = actions.toLowerCase();
				const state = status.toLowerCase() == 'on' ? 1 : 0;
				this.stateStatus[action] = state;
				let isinya = "Status: \n";
				for (var k in this.stateStatus) {
					if (typeof this.stateStatus[k] !== 'function') {
						if (this.stateStatus[k] == 1) {
							isinya += "▷" + firstToUpperCase(k) + " ⇒ on\n";
						} else {
							isinya += "▷" + firstToUpperCase(k) + " ⇒ off\n";
						}
					}
				}
				//this._sendMessage(seq,`Status: \n${JSON.stringify(this.stateStatus)}`);
				this._sendMessage(seq, isinya);
			} else {
				this._sendMessage(seq, `Not permitted!`);
			}
		}
	}

	async mention(listMember) {
		let mentionStrings = [''];
		let mid = [''];
		for (var i = 0; i < listMember.length; i++) {
			mentionStrings.push('@' + listMember[i].displayName + ' \n');
			mid.push(listMember[i].mid);
		}
		let strings = mentionStrings.join('');
		let member = strings.split('@').slice(1);

		let tmp = 0;
		let memberStart = [];
		let mentionMember = member.map((v, k) => {
			let z = tmp += v.length + 1;
			let end = z - 1;
			memberStart.push(end);
			let mentionz = `{"S":"${(isNaN(memberStart[k - 1] + 1) ? 0 : memberStart[k - 1] + 1 ) }","E":"${end}","M":"${mid[k + 1]}"}`;
			return mentionz;
		})
		return {
			names: mentionStrings.slice(1),
			cmddata: {
				MENTION: `{"MENTIONEES":[${mentionMember}]}`
			}
		}
	}

	async tagAlls(seq) {
		let {
			listMember
		} = await this.searchGroup(seq.to);
		seq.text = "";
		let mentionMemberx = [];
		for (var i = 0; i < listMember.length; i++) {
			if (seq.text == null || typeof seq.text === "undefined" || !seq.text) {
				let namanya = listMember[i].dn;
				let midnya = listMember[i].mid;
				seq.text += "@" + namanya + " \n";
				let member = [namanya];

				let tmp = 0;
				let mentionMember1 = member.map((v, k) => {
					let z = tmp += v.length + 3;
					let end = z;
					let mentionz = `{"S":"0","E":"${end}","M":"${midnya}"}`;
					return mentionz;
				})
				mentionMemberx.push(mentionMember1);
			} else {
				let namanya = listMember[i].dn;
				let midnya = listMember[i].mid;
				let kata = seq.text.split("");
				let panjang = kata.length;
				seq.text += "@" + namanya + " \n";
				let member = [namanya];

				let tmp = 0;
				let mentionMember = member.map((v, k) => {
					let z = tmp += v.length + 3;
					let end = z + panjang;
					let mentionz = `{"S":"${panjang}","E":"${end}","M":"${midnya}"}`;
					return mentionz;
				})
				mentionMemberx.push(mentionMember);
			}
		}
		const tag = {
			cmddata: {
				MENTION: `{"MENTIONEES":[${mentionMemberx}]}`
			}
		}
		seq.contentMetadata = tag.cmddata;
		this._client.sendMessage(0, seq);
	}


	async recheck(cs, group) {
		let users;
		for (var i = 0; i < cs.length; i++) {
			if (cs[i].group == group) {
				users = cs[i].users;
			}
		}

		let contactMember = await this._getContacts(users);
		return contactMember.map((z) => {
			return {
				displayName: z.displayName,
				mid: z.mid
			};
		});
	}

	async removeReaderByGroup(groupID) {
		const groupIndex = this.checkReader.findIndex(v => {
			if (v.group == groupID) {
				return v
			}
		})

		if (groupIndex != -1) {
			this.checkReader.splice(groupIndex, 1);
		}
	}


	async textMessage(textMessages, seq, param, lockt) {
		const [cmd, payload] = textMessages.split(' ');
		const gTicket = textMessages.split('line://ti/g/');
		const linktxt = textMessages.split('http');
		const txt = textMessages.toLowerCase();
		const messageID = seq.id;
		const cot = txt.split('@');
		const com = txt.split(':');
		const cox = txt.split(' ');

		var optreply_haihalo = ['ya', 'nani?', 'apaan?', 'hmm', 'kenapa', 'apa?', 'yoo', 'iya,', 'ea', 'iyah'];
		var randomNumber1 = Math.floor(Math.random() * optreply_haihalo.length);
		var reply_haihalo = (optreply_haihalo[randomNumber1]);
		/*
				if(vx[1] == "!sendcontact" && seq.from_ == vx[0] && waitMsg == "yes"){
					let panjang = txt.split("");
					if(txt == "cancel"){
						vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
						this._sendMessage(seq,"# CANCELLED");
					}else if(txt == "me"){
						vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
						seq.text = "Me";seq.contentType = 13;
						seq.contentMetadata = { mid: seq.from_ };
						this._client.sendMessage(0, seq);
					}else if(cot[1]){
						vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
						let ment = seq.contentMetadata.MENTION;
					    let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;
						seq.text = "Me";seq.contentType = 13;
						seq.contentMetadata = { mid: pment };
						this._client.sendMessage(0, seq);
					}else if(vx[2] == "arg1" && panjang.length > 30 && panjang[0] == "u"){
						vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
						seq.text = "Me";seq.contentType = 13;
						seq.contentMetadata = { mid: txt };
						this._client.sendMessage(0, seq);
					}else{
						this._sendMessage(seq,"Tag orangnya atau kirim midnya bang !");
					}
				}
				if(txt == "!sendcontact" && !isBanned(banList, seq.from_)){
					if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
					    waitMsg = "yes";
					    vx[0] = seq.from_;vx[1] = txt;vx[2] = "arg1";
					    this._sendMessage(seq,"Kontaknya siapa bang ? #Tag orangnya atau kirim midnya");
					}else{
						waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
						this._sendMessage(seq,"#CANCELLED");
					}
				}else if(txt == '!sendcontact' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}

				if(vx[1] == "!addcontact" && seq.from_ == vx[0] && waitMsg == "yes"){
					let panjang = txt.split("");
					if(txt == "cancel"){
						vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
						this._sendMessage(seq,"# CANCELLED");
					}else if(seq.contentType == 13){
						vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
						let midnya = seq.contentMetadata.mid;
						let listContacts = await this._client.getAllContactIds();
						for(var i = 0; i < listContacts.length; i++){
							if(listContacts[i] == midnya){
								vx[4] = "sudah";
								break;
							}
						}
						let bang = new Message();
						bang.to = seq.to;
						if(vx[4] == "sudah"){
							bang.text = "Dia sudah masuk friendlist bang, gk bisa ku add lagi !";
							this._client.sendMessage(0, bang);
						}else{
						    bang.text = "Ok bang !, Sudah ku add !";
						    await this._client.findAndAddContactsByMid(seq, midnya);
						    this._client.sendMessage(0, bang);
						}vx[4] = "";
					}else if(cot[1]){
						vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
						let ment = seq.contentMetadata.MENTION;
					    let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;let midnya = pment;
						let listContacts = await this._client.getAllContactIds();
						for(var i = 0; i < listContacts.length; i++){
							if(listContacts[i] == midnya){
								vx[4] = "sudah";
								break;
							}
						}
						let bang = new Message();
						bang.to = seq.to;
						if(vx[4] == "sudah"){
							bang.text = "Dia sudah masuk friendlist bang, gk bisa ku add lagi !";
							this._client.sendMessage(0, bang);
						}else{
						    bang.text = "Ok bang !, Sudah ku add !";
						    await this._client.findAndAddContactsByMid(seq, midnya);
						    this._client.sendMessage(0, bang);
						}vx[4] = "";
					}else if(vx[2] == "arg1" && panjang.length > 30 && panjang[0] == "u"){
						vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
						let midnya = txt;
						let listContacts = await this._client.getAllContactIds();
						for(var i = 0; i < listContacts.length; i++){
							if(listContacts[i] == midnya){
								vx[4] = "sudah";
								break;
							}
						}
						let bang = new Message();
						bang.to = seq.to;
						if(vx[4] == "sudah"){
							bang.text = "Dia sudah masuk friendlist bang, gk bisa ku add lagi !";
							this._client.sendMessage(0, bang);
						}else{
						    bang.text = "Ok bang !, Sudah ku add !";
						    await this._client.findAndAddContactsByMid(seq, midnya);
						    this._client.sendMessage(0, bang);
						}vx[4] = "";
					}else{
						let bang = new Message();
						bang.to = seq.to;
						bang.text = "# How to !addcontact\n-Kirim Contact Orang Yang Mau Di Add\n-Kirim Mid Orang Yang Mau Di Add\n-Atau Tag Orang Yang Mau Di Add";
						this._client.sendMessage(0,bang);
					}
				}
				if(txt == "!addcontact" && isAdminOrBot(seq.from_)){
					if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
					    waitMsg = "yes";
					    vx[0] = seq.from_;vx[1] = txt;vx[2] = "arg1";
					    this._sendMessage(seq,"Kontaknya siapa bang ? #Tag orangnya atau kirim kontaknya");
					}else{
						waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
						this._sendMessage(seq,"#CANCELLED");
					}
				}else if(txt == '!addcontact' && !isAdminOrBot(seq.from_)){this._sendMessage(seq,"Not permitted !");}
			*/
		if (vx[1] == "!cekid" && seq.from_ == vx[0] && waitMsg == "yes") {
			let panjang = txt.split("");
			if (txt == "cancel") {
				vx[0] = "";
				vx[1] = "";
				waitMsg = "no";
				vx[2] = "";
				vx[3] = "";
				this._sendMessage(seq, "# CANCELLED");
			} else if (seq.contentType == 13) {
				vx[0] = "";
				vx[1] = "";
				waitMsg = "no";
				vx[2] = "";
				vx[3] = "";
				let midnya = seq.contentMetadata.mid;
				let bang = new Message();
				bang.to = seq.to;
				bang.text = midnya;
				this._client.sendMessage(0, bang);
			} else if (txt == "me") {
				vx[0] = "";
				vx[1] = "";
				waitMsg = "no";
				vx[2] = "";
				vx[3] = "";
				seq.text = seq.from_.toString();
				this._client.sendMessage(0, seq);
			} else if (cot[1]) {
				vx[0] = "";
				vx[1] = "";
				waitMsg = "no";
				vx[2] = "";
				vx[3] = "";
				let cekid = new Message();
				cekid.to = seq.to;
				let ment = seq.contentMetadata.MENTION;
				let xment = JSON.parse(ment);
				let pment = xment.MENTIONEES[0].M;
				cekid.text = JSON.stringify(pment).replace(/"/g, "");
				this._client.sendMessage(0, cekid);
			} else {
				let bang = new Message();
				bang.to = seq.to;
				bang.text = "# How to !cekid\nTag orangnya / kirim kontak yang mau di-cek idnya !";
				this._client.sendMessage(0, bang);
			}
		}
		if (txt == "!cekid" && !isBanned(banList, seq.from_)) {
			if (vx[2] == null || typeof vx[2] === "undefined" || !vx[2]) {
				waitMsg = "yes";
				vx[0] = seq.from_;
				vx[1] = txt;
				vx[2] = "arg1";
				this._sendMessage(seq, "Cek ID siapa bang ? #Kirim kontaknya");
				this._sendMessage(seq, "Atau bisa juga @tag orangnya");
			} else {
				waitMsg = "no";
				vx[0] = "";
				vx[1] = "";
				vx[2] = "";
				vx[3] = "";
				this._sendMessage(seq, "#CANCELLED");
			}
		} else if (txt == '!cekid' && isBanned(banList, seq.from_)) {
			this._sendMessage(seq, "Not permitted !");
		}

		/*		
		if(vx[1] == "!msg" && seq.from_ == vx[0] && waitMsg == "yes"){
			//vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
			let panjang = txt.split("");
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else if(vx[2] == "arg1" && vx[3] == "mid" && cot[1]){
				let bang = new Message();bang.to = seq.to;
				bang.text = "OK !, btw pesan-nya apa ?"
				this._client.sendMessage(0,bang);
				let ment = seq.contentMetadata.MENTION;
				let xment = JSON.parse(ment);
				let pment = xment.MENTIONEES[0].M;
				let midnya = JSON.stringify(pment);
				vx[4] = midnya;
				vx[2] = "arg2";
			}else if(vx[2] == "arg1" && vx[3] == "mid" && seq.contentType == 13){
				let midnya = seq.contentMetadata.mid;let bang = new Message();bang.to = seq.to;
				bang.text = "OK !, btw pesan-nya apa ?"
				this._client.sendMessage(0,bang);
				vx[4] = midnya;
				vx[2] = "arg2";
			}else if(vx[2] == "arg1" && vx[3] == "mid" && panjang.length > 30){
				this._sendMessage(seq,"OK !, btw pesan-nya apa ?");
				vx[4] = txt;
				vx[2] = "arg2";
			}else if(vx[2] == "arg2" && vx[3] == "mid"){
				let panjangs = vx[4].split("");
				let kirim = new Message();let bang = new Message();
				bang.to = seq.to;
				if(panjangs[0] == "u"){
					kirim.toType = 0;
				}else if(panjangs[0] == "c"){
					kirim.toType = 2;
				}else if(panjangs[0] == "r"){
					kirim.toType = 1;
				}else{
					kirim.toType = 0;
				}
				bang.text = "Terkirim bang !";
				kirim.to = vx[4];
				kirim.text = txt;
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";vx[4] = "";
				this._client.sendMessage(0, kirim);
				this._client.sendMessage(0, bang);
			}else{
				let bang = new Message();
				bang.to = seq.to;
				bang.text = "# How to !msg\nTag / Kirim Kontak / Kirim Mid orang yang mau dikirimkan pesan !";
				this._client.sendMessage(0,bang);
			}
		}if(txt == "!msg" && !isBanned(banList, seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;vx[3] = "mid";
			    this._sendMessage(seq,"Mau kirim pesan ke siapa bang ?");
				this._sendMessage(seq,"Tag / Kirim Kontak / Kirim Mid orang yang mau dikirimkan pesan !");
				vx[2] = "arg1";
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == '!msg' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}
*/
		if (vx[1] == "!ban" && seq.from_ == vx[0] && waitMsg == "yes") {
			let panjang = txt.split("");
			if (txt == "cancel") {
				vx[0] = "";
				vx[1] = "";
				waitMsg = "no";
				vx[2] = "";
				vx[3] = "";
				this._sendMessage(seq, "Canceled");
			} else if (cot[1]) {
				let ment = seq.contentMetadata.MENTION;
				let xment = JSON.parse(ment);
				let pment = xment.MENTIONEES[0].M;
				let msg = new Message();
				msg.to = seq.to;
				if (isBanned(banList, pment)) {
					waitMsg = "no";
					vx[0] = "";
					vx[1] = "";
					vx[2] = "";
					vx[3] = "";
					msg.text = cot[1] + "already...";
					this._client.sendMessage(0, msg);
				} else {
					msg.text = "Done!";
					this._client.sendMessage(0, msg);
					banList.push(pment);
					waitMsg = "no";
					vx[0] = "";
					vx[1] = "";
					vx[2] = "";
					vx[3] = "";
				}
			}
		}
		if (txt == "!ban" && isAdminOrBot(seq.from_)) {
			if (vx[2] == null || typeof vx[2] === "undefined" || !vx[2]) {
				waitMsg = "yes";
				vx[0] = seq.from_;
				vx[1] = txt;
				this._sendMessage(seq, "Ban siapa? tag orangnya");
				vx[2] = "arg1";
				//this._sendMessage(seq,"# Kirim kontaknya / mid / tag orangnya");
			} else {
				waitMsg = "no";
				vx[0] = "";
				vx[1] = "";
				vx[2] = "";
				vx[3] = "";
				this._sendMessage(seq, "Canceled");
			}
		} else if (txt == "!ban" && !isAdminOrBot(seq.from_)) {
			this._sendMessage(seq, "Not permitted!");
		}

		if (vx[1] == "!unban" && seq.from_ == vx[0] && waitMsg == "yes") {
			let panjang = txt.split("");
			if (txt == "cancel") {
				vx[0] = "";
				vx[1] = "";
				waitMsg = "no";
				vx[2] = "";
				vx[3] = "";
				this._sendMessage(seq, "Canceled");
			} else if (cot[1]) {
				let ment = seq.contentMetadata.MENTION;
				let xment = JSON.parse(ment);
				let pment = xment.MENTIONEES[0].M;
				let bang = new Message();
				bang.to = seq.to;
				if (isBanned(banList, pment)) {
					let ment = banList.indexOf(pment);
					if (ment > -1) {
						banList.splice(ment, 1);
					}
					waitMsg = "no";
					vx[0] = "";
					vx[1] = "";
					vx[2] = "";
					vx[3] = "";
					bang.text = "Done!";
					this._client.sendMessage(0, bang);
				} else {
					bang.text = "Error! not in list";
					this._client.sendMessage(0, bang);
				}
			} else {
				//this._sendMessage(seq,"# How to !unban\nKirim kontaknya / mid / tag orangnya yang mau di-unban");
			}
		}
		if (txt == "!unban" && isAdminOrBot(seq.from_)) {
			if (vx[2] == null || typeof vx[2] === "undefined" || !vx[2]) {
				waitMsg = "yes";
				vx[0] = seq.from_;
				vx[1] = txt;
				seq.text = "";
				for (var i = 0; i < banList.length; i++) {
					let orangnya = await this._getContacts([banList[i]]);
					seq.text += "Banlist: \n[" + orangnya[0].displayName + "]\n"; //["+orangnya[0].mid+"]
				}
				this._sendMessage(seq, seq.text);
				this._sendMessage(seq, "unban siapa ?");
				vx[2] = "arg1";
			} else {
				waitMsg = "no";
				vx[0] = "";
				vx[1] = "";
				vx[2] = "";
				vx[3] = "";
				this._sendMessage(seq, "Canceled");
			}
		} else if (txt == "!unban" && !isAdminOrBot(seq.from_)) {
			this._sendMessage(seq, "Not permitted!");
		}

		if (txt == "!banlist") {
			seq.text = "Banned List: \n"; //[Mid] 
			for (var i = 0; i < banList.length; i++) {
				let orangnya = await this._getContacts([banList[i]]);
				seq.text += "[" + orangnya[0].displayName + "]\n"; //["+orangnya[0].mid+"]
			}
			this._sendMessage(seq, seq.text);
		}


		if (txt == ".botleft" || txt == 'Bot left' || txt == 'bot left') {
			this._client.leaveGroup(0, seq.to);
		}

		if (txt == "!mute" && isAdminOrBot(seq.from_)) {
			this.stateStatus.mute = 1;
			this._sendMessage(seq, "(*´﹃｀*)")
		}

		if (txt == '!cancel' && this.stateStatus.cancel == 1 && isAdminOrBot(seq.from_)) {
			this.cancelAll(seq.to);
		} else if (txt == "!cancel" && !isAdminOrBot(seq.from_)) {
			this._sendMessage(seq, "Not permitted !");
		}

		if (vx[1] == "!grouputil" && seq.from_ == vx[0] && waitMsg == "yes") {
			if (vx[2] == "arg1") {
				let M = new Message();
				let listGroups = await this._client.getGroupIdsJoined();
				let xtxt = "「 Group List 」\n\n";
				switch (txt) {
					case 'list':
						vx[0] = "";
						vx[1] = "";
						waitMsg = "no";
						vx[2] = "";
						vx[3] = "";
						groupList = [];
						M.to = seq.to;
						listGroups.forEach(function (item, index, array) {
							groupList.push(item);
						});
						for (var i = 0; i < groupList.length; i++) {
							let numb = i + 1;
							let groupInfo = await this._client.getGroup(groupList[i]);
							let gname = groupInfo.name;
							let memberCount = groupInfo.members.length;
							xtxt += numb + "). " + gname + " (" + memberCount + ")\n";
						}
						M.text = xtxt;
						this._client.sendMessage(0, M);
						break;
					case 'ticket':
						vx[2] = "arg2";
						vx[3] = "ticket";
						M.to = seq.to;
						groupList = [];
						M.text = "Pilih nomor group dibawah ini !";
						await this._client.sendMessage(0, M);
						listGroups.forEach(function (item, index, array) {
							groupList.push(item);
						});
						for (var i = 0; i < groupList.length; i++) {
							let numb = i + 1;
							let groupInfo = await this._client.getGroup(groupList[i]);
							let gname = groupInfo.name;
							let memberCount = groupInfo.members.length;
							xtxt += numb + "). " + gname + " (" + memberCount + ")\n";
						}
						M.text = xtxt;
						this._client.sendMessage(0, M);
						break;
					default:
						vx[0] = "";
						vx[1] = "";
						waitMsg = "no";
						vx[2] = "";
						vx[3] = "";
						//this._sendMessage(seq,"#CANCELLED");
				}
			} else if (vx[2] == "arg2" && vx[3] == "ticket") {
				vx[0] = "";
				vx[1] = "";
				waitMsg = "no";
				vx[2] = "";
				vx[3] = "";
				if (typeof groupList[txt - 1] !== 'undefined') {
					let updateGroup = await this._getGroup(groupList[txt - 1]);
					if (updateGroup.preventJoinByTicket === true) {
						updateGroup.preventJoinByTicket = false;
						await this._updateGroup(updateGroup);
					}
					const groupUrl = await this._reissueGroupTicket(groupList[txt - 1]);
					this._sendMessage(seq, "Line Group -> line://ti/g/" + groupUrl);
				} else {
					this._sendMessage(seq, "Group tidak ada !");
				}
			}
		}
		if (txt == "!grouputil" && isAdminOrBot(seq.from_)) {
			if (vx[2] == null || typeof vx[2] === "undefined" || !vx[2]) {
				waitMsg = "yes";
				vx[0] = seq.from_;
				vx[1] = txt;
				this._sendMessage(seq, "「 Group Utility 」\n- Grouplist = list\n- Group Ticket = ticket\n");
				vx[2] = "arg1";
			} else {
				waitMsg = "no";
				vx[0] = "";
				vx[1] = "";
				vx[2] = "";
				vx[3] = "";
				//this._sendMessage(seq,"#CANCELLED");
			}
		} else if (txt == "!grouputil" && !isAdminOrBot(seq.from_)) {
			this._sendMessage(seq, "Not permitted !");
		}

		if (cox[0] == "!bc" && isAdminOrBot(seq.from_) && cox[1]) {
			let listMID = [];
			let bcText = textMessages.split(" ").slice(1).toString().replace(/,/g, " ");
			let bcm = new Message();
			bcm.toType = 0;
			//let listContacts = await this._client.getAllContactIds();listMID.push(listContacts);
			let listGroups = await this._client.getGroupIdsJoined();
			listMID.push(listGroups);
			for (var i = 0; i < listMID.length; i++) {
				for (var xi = 0; xi < listMID[i].length; xi++) {
					bcm.to = listMID[i][xi];
					let midc = listMID[i][xi].split("");
					if (midc[0] == "u") {
						bcm.toType = 0;
					} else if (midc[0] == "c") {
						bcm.toType = 2;
					} else if (midc[0] == "r") {
						bcm.toType = 1;
					} else {
						bcm.toType = 0;
					}
					bcm.text = bcText;
					this._client.sendMessage(0, bcm);
				}
			}
		} else if (cox[0] == "!bc" && isAdminOrBot(seq.from_) && !cox[1]) {
			this._sendMessage(seq, "# How to broadcast:\nbroadcast yourtexthere");
		} else if (cox[0] == "!bc" && !isAdminOrBot(seq.from_)) {
			this._sendMessage(seq, "Not permitted!");
		}

		if (txt == ".kickme" && seq.toType == 2 && this.stateStatus.kick == 1) {
			this._sendMessage(seq, "Ok bang !");
			this._kickMember(seq.to, [seq.from_]);
		}


		if (txt == "!refresh" && isAdminOrBot(seq.from_)) {
			this._sendMessage(seq, "Clean all message....");
			await this._client.removeAllMessages();
			this._sendMessage(seq, "Done !");
		}

		const sp = ['sp', 'Speed', 'resp', 'respon'];
		if (sp.includes(txt) && !isBanned(banList, seq.from_)) {
			const curTime = (Date.now() / 1000);
			let M = new Message();
			M.to = seq.to;
			M.text = '';
			M.contentType = 1;
			M.contentPreview = null;
			M.contentMetadata = null;
			await this._client.sendMessage(0, M);
			const rtime = (Date.now() / 1000);
			const xtime = rtime - curTime;
			this._sendMessage(seq, xtime + ' second');
		} else if (sp.includes(txt) && isBanned(banList, seq.from_)) {
			this._sendMessage(seq, "Not permitted !");
		}

		/*if(txt === 'kernel') {
		    exec('uname -a;ptime;id;whoami',(err, sto) => {
		        this._sendMessage(seq, sto);
		    })
		}*/

		if (txt === '!kickall' && this.stateStatus.kick == 1 && isAdminOrBot(seq.from_) && seq.toType == 2) {
			let {
				listMember
			} = await this.searchGroup(seq.to);
			for (var i = 0; i < listMember.length; i++) {
				if (!isAdminOrBot(listMember[i].mid)) {
					this._kickMember(seq.to, [listMember[i].mid])
				}
			}
		} else if (txt === '!kickall' && !isAdminOrBot(seq.from_) && seq.toType == 2) {
			this._sendMessage(seq, "Not permitted !");
		}

		if (txt == '.key' || txt == 'help' || txt == 'key') {
			let botOwner = await this._client.getContacts([myBot[0]]);
			let {
				mid,
				displayName
			} = await this._client.getProfile();
			seq.text = this.keyhelp;
			this._client.sendMessage(0, seq);
		}

		if (txt == '0101' && lockt == 1) { //Jangan dicoba (gk ada efek)
			let {
				listMember
			} = await this.searchGroup(seq.to);
			for (var i = 0; i < listMember.length; i++) {
				if (listMember[i].mid == param) {
					let namanya = listMember[i].dn;
					seq.text = 'Halo @' + namanya + ', Selamat datang 😀';
					let midnya = listMember[i].mid;
					let kata = seq.text.split("@").slice(0, 1);
					let kata2 = kata[0].split("");
					let panjang = kata2.length;
					let member = [namanya];

					let tmp = 0;
					let mentionMember = member.map((v, k) => {
						let z = tmp += v.length + 1;
						let end = z + panjang;
						let mentionz = `{"S":"${panjang}","E":"${end}","M":"${midnya}"}`;
						return mentionz;
					})
					const tag = {
						cmddata: {
							MENTION: `{"MENTIONEES":[${mentionMember}]}`
						}
					}
					seq.contentMetadata = tag.cmddata;
					this._client.sendMessage(0, seq);
					console.info("Salam");
				}
			}
		}

		if (txt == '.tagall' || txt == 'tag all' && seq.toType == 2) {
			let {
				listMember
			} = await this.searchGroup(seq.to);
			const mentions = await this.mention(listMember);
			seq.contentMetadata = mentions.cmddata;
			await this._sendMessage(seq, mentions.names.join(''))
		}

		if (txt == '0103' && lockt == 1) {
			let ax = await this._client.getGroup(seq.to);
			if (ax.preventJoinByTicket === true) {

			} else {
				ax.preventJoinByTicket = true;
				await this._client.updateGroup(0, ax);
			}
		}

		if (txt == '0104' && lockt == 1) {
			let ax = await this._client.getGroup(seq.to);
			if (ax.preventJoinByTicket === true) {
				ax.preventJoinByTicket = false;
				await this._client.updateGroup(0, ax);
			}

		}

		if (txt == '.set') {
			this._sendMessage(seq, `setpoint (｀・ω・´)`);
			this.removeReaderByGroup(seq.to);
		}

		if (txt == '.clear') {
			this.checkReader = []
			this._sendMessage(seq, `Removed`);
		}

		if (txt == '.recheck') {
			let rec = await this.recheck(this.checkReader, seq.to);
			seq.text = '';
			const mentions = await this.mention(rec);
			seq.contentMetadata = mentions.cmddata;
			await this._sendMessage(seq, mentions.names.join(''));
		}

		if (txt == 'sider' || txt == '.sider') {
			this._sendMessage(seq, `「  Sider  」\n.set				=> untuk set point\n.recheck	=> untuk check result\n.clear			=> remove result`)
		}

		if (txt == '.botinfo' || txt == 'bot info') {
			let probot = await this._client.getProfile();
			let settings = await this._client.getSettings();
			let M = new Message();
			M.to = seq.to;
			M.text = 'Bot Name: ' + probot.displayName + '\n\
			Bot LINE_ID: line://ti/p/~fee.moe\n\
			Bot Creator: Yogs\nANTI TEAM 😎';
			this._client.sendMessage(0, M);
			//Bot Ticket: http://line.me/ti/p/'+settings.contactMyTicket+'\n\
		}

		if (txt == "!kickban" && isAdminOrBot(seq.from_)) {
			for (var i = 0; i < banList.length; i++) {
				let adaGk = await this.isInGroup(seq.to, banList[i]);
				if (typeof adaGk !== "undefined" && adaGk) {
					this._kickMember(seq.to, adaGk);
				}
			}
		}
		/*
		if(txt == "mysquad invite" && isAdminOrBot(seq.from_)){
		const mysquad = ['u73973a602fcbeff61a047d4966f4397a','u1afdb19243e7233c2b03a691a5a24bd6','uc185a46d66018210c649a9d7616cc1e5','u9c76171a662ff162482ecf20486e21cf','u05ca28fb987817ad9fb186583ff2634b','uc0a973dee79a6efe035f02488cc75cc3','u7e9ae368eb72f685a2555f16850618cc'];
		for(var i = 0; i < mysquad.length; i++){
			let mysd = await this.isInGroup(seq.to, mysquad[i]);
			if(typeof mysd !== "undefined" && mysd){
				this._inviteIntoGroup(seq.to, mysd);
			}
		}}
		*/
		if (txt == ".status" || txt == 'bot stat') {
			this.setState(seq, 1)
		}

		const action = ['autojoin on', 'autojoin off', 'cancel on', 'cancel off', 'kick on', 'kick off', 'salam on', 'salam off', 'protect off', 'protect on', 'chat on', 'chat off']; //,'qr on','qr off'
		if (action.includes(txt) && isAdminOrBot(seq.from_)) {
			this.setState(seq, 0)
		}

		if (txt == '.myid' || txt == 'myid') {
			this._sendMessage(seq, "ID: " + seq.from_);
		}

		if (txt == ".time" || txt == 'time') {
			var moment = require('moment');
			var time = moment();
			var time_format = time.format('HH:mm:ss');
			var date_format = time.format('YYYY-MM-DD');
			this._sendMessage(seq, "Time Info: \nJam: " + time_format + "\nTanggal: " + date_format);
		}

		if (txt == '.ginfo' || txt == 'ginfo' && seq.toType == 2 && !isBanned(banList, seq.from_)) {
			let groupInfo = await this._client.getGroup(seq.to);
			let gqr = 'open';
			let ticketg = 'line://ti/g/';
			let createdT64 = groupInfo.createdTime.toString().split(" ");
			let createdTime = await this._getServerTime(createdT64[0]);
			let gid = seq.to;
			let gticket = groupInfo.groupPreference.invitationTicket;
			if (!gticket) {
				ticketg = "CLOSED";
			} else {
				ticketg += gticket;
			}
			let gname = groupInfo.name;
			let memberCount = groupInfo.members.length;
			let gcreator = groupInfo.creator.displayName;
			let pendingCount = 0;
			if (groupInfo.invitee !== null) {
				console.info("pendingExist");
				pendingCount = groupInfo.invitee.length;
			}
			let gcover = groupInfo.pictureStatus;
			let qr = groupInfo.preventJoinByTicket;
			if (qr === true) {
				gqr = 'close';
			}
			let bang = new Message();
			bang.to = seq.to;

			bang.text = "# Group Name:\n" + gname + "\n\
			\n# Group ID:\n" + gid + "\n\
			\n# Group Creator:\n" + gcreator + "\n\
			\n# Group CreatedTime:\n" + createdTime + "\n\
			\n# Group Ticket:\n" + ticketg + "\n\
			\n# Member: " + memberCount + "\n\
			\n# Pending: " + pendingCount + "\n\
			\n# QR: " + gqr;
			//\n# Group Cover:\nhttp://dl.profile.line.naver.jp/"+gcover
			this._client.sendMessage(0, bang);
		} else if (txt == '.ginfo') {
			this._sendMessage(seq, "Not permitted !");
		}

		const joinByUrl = ['.gurl', '.curl', 'ourl'];
		if (joinByUrl.includes(txt) && txt == ".gurl" || txt == "gurl" || txt == "ourl") {
			this._sendMessage(seq, `Updating group ...`);
			let updateGroup = await this._getGroup(seq.to);
			console.info(updateGroup);
			if (updateGroup.preventJoinByTicket === true) {
				updateGroup.preventJoinByTicket = false;
				await this._updateGroup(updateGroup);
			}
			const groupUrl = await this._reissueGroupTicket(seq.to)
			this._sendMessage(seq, `Line group = line://ti/g/${groupUrl}`);
		} else if (joinByUrl.includes(txt) && txt == ".curl" || txt == "curl") {
			this._sendMessage(seq, `Updating group ...`);
			let updateGroup = await this._getGroup(seq.to);
			console.info(updateGroup);
			if (updateGroup.preventJoinByTicket === false) {
				updateGroup.preventJoinByTicket = true;
				await this._updateGroup(updateGroup);
				seq.text = "Done !";
			} else {
				seq.text = "Sudah ditutup !";
			}
			this._sendMessage(seq, seq.text);
		}
		/*
		if(txt == "0105" && lockt == 1){
			let aas = new Message();
			aas.to = param;
			let updateGroup = await this._getGroup(seq.to);
            if(updateGroup.preventJoinByTicket === true) {
                updateGroup.preventJoinByTicket = false;
				await this._updateGroup(updateGroup);
            }
			const groupUrl = await this._reissueGroupTicket(seq.to);
			aas.toType = 0;
			aas.text = `!join line://ti/g/${groupUrl}`;
			this._client.sendMessage(0, aas);
		}
		
		if(txt == "0106" && lockt == 1){
			let friend = await this.isItFriend(param);
			if(friend == "no"){
				await this._client.findAndAddContactsByMid(0, param);
				this._client.inviteIntoGroup(0,seq.to,[param]);
			}else{this._client.inviteIntoGroup(0,seq.to,[param]);}
		}
		
		if(gTicket[0] == "!join" && isAdminOrBot(seq.from_)){
			let sudah = "no";
			let grp = await this._client.findGroupByTicket(gTicket[1]);
			let lGroup = await this._client.getGroupIdsJoined();
			for(var i = 0; i < lGroup.length; i++){
				if(grp.id == lGroup[i]){
					sudah = "ya";
				}
			}
			if(sudah == "ya"){
				let bang = new Message();
				bang.to = seq.to;
				bang.text = "Gagal join bang, eneng udah masuk groupnya";
				this._client.sendMessage(0,bang);
			}else if(sudah == "no"){
				await this._acceptGroupInvitationByTicket(grp.id,gTicket[1]);
			}
		}
		*/
		//SPAM HERE
		if (isAdminOrBot(seq.from_)) {
			var assssa = "up";
			switch (txt) {
				case '!1':
					for (var i = 0; i < 10; i++) {
						this._sendMessage(seq, assssa);
					}
					break;
				case '!2':
					for (var i = 0; i < 20; i++) {
						this._sendMessage(seq, assssa);
					}
					break;
				case '!3':
					for (var i = 0; i < 50; i++) {
						this._sendMessage(seq, assssa);
					}
					break;
				case '!4':
					for (var i = 0; i < 100; i++) {
						this._sendMessage(seq, assssa);
					}
					break;
				case '!5':
					for (var i = 0; i < 200; i++) {
						this._sendMessage(seq, assssa);
					}
					break;
			}
		}

		//chat bot

		if (txt == 'moshi' || txt == 'mos') {
			this._sendMessage(seq, reply_haihalo);
		}

		//chat bot

		if (this.stateStatus.chat == 1) {
			switch (txt) {
				case 'moshi?':
					this._sendMessage(seq, 'bot kak ^_^');
					break;
				case 'moshi siapa?':
					this._sendMessage(seq, 'bot kak ^_^');
					break;
				case 'siapa moshi?':
					this._sendMessage(seq, 'bot kak ^_^');
					break;
				case 'moshi itu siapa?':
					this._sendMessage(seq, 'bot kak ^_^');
					break;
				case 'halo':
					this._sendMessage(seq, 'halo disini moshi...');
					break;
				case 'hi':
					this._sendMessage(seq, 'hi disini moshi...');
					break;
				case 'pagi':
					this._sendMessage(seq, 'pagi juga kkak :)');
					this._sendMessage(seq, 'jangan lupa sarapan ya');
					break;
				case 'morning':
					this._sendMessage(seq, 'pagi juga kkak :)');
					this._sendMessage(seq, 'jangan lupa sarapan ya');
					break;
				case 'siang':
					this._sendMessage(seq, 'siang juga kkak :)');
					this._sendMessage(seq, 'lagi apa kak?');
					break;
				case 'sore':
					this._sendMessage(seq, 'sore juga kkak :)');
					break;
				case 'malam':
					this._sendMessage(seq, 'yg bilang ini msih pagi spa kak!?');
					break;
				case 'malem':
					this._sendMessage(seq, 'malam juga kkak :D');
					break;
				case 'night':
					this._sendMessage(seq, 'night juga');
					break;
				case '@bye':
					this._sendMessage(seq, 'ihhh kkak main ngusir aja');
					break;
				case 'Bye':
					this._sendMessage(seq, 'byeee, semoga diterima amalnya');
					break;
				case 'sayang':
					this._sendMessage(seq, 'knpa sayangku?');
					break;
				case 'moshi udah makan?':
					this._sendMessage(seq, 'kepo');
					break;
				case 'moshi lagi apa?':
					this._sendMessage(seq, 'lagi inget mantan kak');
					break;
				case 'sayang lagi apa?':
					this._sendMessage(seq, 'lagi berusaha melupakannya~~');
					break;
				case 'sayang udah makan?':
					this._sendMessage(seq, 'tadi habis makan hati kok');
					break;
				case 'gpp':
					this._sendMessage(seq, 'lah, kenapa kak?');
					break;
				case 'dih':
					this._sendMessage(seq, 'apa u');
					break;
				case 'Bot':
					this._sendMessage(seq, 'iya aku bot kak ^_^');
					break;
				case 'gabut':
					this._sendMessage(seq, 'oh');
					break;
				case 'u bau':
					this._sendMessage(seq, 'u juga :p');
					break;
				case 'moshi bodoh':
					this._sendMessage(seq, 'serah deh');
					break;
				case 'moshi jelek':
					this._sendMessage(seq, 'serah deh');
					break;
				case 'moshi jahat':
					this._sendMessage(seq, 'sok tau');
					break;
			}
		}
		// other

	}
}

module.exports = new LINE();