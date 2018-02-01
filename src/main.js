const LineAPI = require('./api');
const request = require('request');
const fs = require('fs');
const unirest = require('unirest');
const webp = require('webp-converter');
const path = require('path');
const rp = require('request-promise');
const config = require('./config');
const moment = require('moment-timezone');
const {
	Message,
	OpType,
	Location
} = require('../curve-thrift/line_types');
//let exec = require('child_process').exec;
const adm0n = ['u05ca28fb987817ad9fb186583ff2634b'];
const myBot = ['u05ca28fb987817ad9fb186583ff2634b', 'u602da153a8b0095217d2fcd9c89a1a92']; 
const banList = []; //Banned list
var groupList = new Array(); //Group list
var vx = {};
var kickhim;
var waitMsg = "no"; //DO NOT CHANGE THIS
var bcText = "Masukan teks untuk broadcast";
var backupProfile = [];
var clone = [];


function isAdminOrBot(param) {
	return myBot.includes(param);
}

function isBanned(banList, param) {
	return banList.includes(param);
}

function firstToUpperCase(str) {
	return str.substr(0, 1).toUpperCase() + str.substr(1);
}

function random(array) {
	return array[Math.floor(Math.random() * array.length)];
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
			chat: 1, //1 = Yes, 0 = No
			sticker: 1
		}
		this.keyhelp = "[Keyword Bot]\
		\nHelp		=> List command\
		\nMyid		=> your id\
		\nGinfo		=> info grup\
		\nOurl		=> open grup url\
		\nCurl		=> close grup url\
		\nKickme	=> kick kamu\
		\nTag all	=> tag all grup member\
		\nSider		=> menu sider\
		\nTime		=> time\
		\nSpeed		=> cek bot speed\
		\nRuntime	=> cek runtime bot\
		\nBot info	=> contact bot\
		\nBot stat	=> view bot status\
		\nBot left	=> bot leave";

		var that = this;
	}

	getOprationType(operations) {
		for (let key in OpType) {
			if (operations.type == OpType[key]) {
				if (key !== 'NOTIFIED_UPDATE_PROFILE' && key !== 'NOTIFIED_RECOMMEND_CONTACT') {
					console.info(`[ ${operations.type} ] ${key} `);
				}
			}
		}
	}

	async poll(operation) {
		if (operation.type == 25 || operation.type == 26) {
			const txt = (operation.message.text !== '' && operation.message.text != null) ? operation.message.text : '';
			let message = new Message(operation.message);
			this.receiverID = message.to = (operation.message.to === myBot[0]) ? operation.message.from_ : operation.message.to;
			Object.assign(message, {
				ct: operation.createdTime.toString()
			});
			if (this.stateStatus.mute != 1) {
				this.textMessage(txt, message);
			} else if (txt == "unmute" && this.stateStatus.mute == 1) { //&& isAdmin(operation.message.from_)
				this.stateStatus.mute = 0;
				this._sendMessage(message, "ヽ(^。^)ノ")
			} else {
				console.info("muted");
			}
		}

		//forward
		if (operation.type == 26 && operation.message.to == 'c1d238e8951802d55d41b6904ae0a0bcd'){
			let sumber = operation.message;
			let getctc = await this._getContacts([operation.message.from_]);
			let dari = getctc[0].displayName;
			let pesan = operation.message.text;
			let ambl = await this._client.getGroup(operation.message.to)
			let namgp = ambl.name
			if(operation.message.contentType== 0 ){
				let frwd = new Message();
				frwd.to = 'c462ced7a742ec2b5ce0db5d106e4e03d';
				frwd.toType = 2;
				frwd.text = dari+": "+pesan;
				this._client.sendMessage(0, frwd);
			}
			else if (operation.message.contentType== 1){
				let frwd = new Message();
				frwd.to = 'c462ced7a742ec2b5ce0db5d106e4e03d';
				frwd.toType = 2;
				frwd.text = dari+" ngirim foto";
				this._client.sendMessage(0, frwd);
			}
			else if (operation.message.contentType== 2){
				let frwd = new Message();
				frwd.to = 'c462ced7a742ec2b5ce0db5d106e4e03d';
				frwd.toType = 2;
				frwd.text = dari+" ngirim video";
				this._client.sendMessage(0, frwd);
			}
			else if (operation.message.contentType== 3){
				let frwd = new Message();
				frwd.to = 'c462ced7a742ec2b5ce0db5d106e4e03d';
				frwd.toType = 2;
				frwd.text = dari+" ngirim voice note";
				this._client.sendMessage(0, frwd);
			}
			else if (operation.message.contentType== 6){
				let frwd = new Message();
				frwd.to = 'c462ced7a742ec2b5ce0db5d106e4e03d';
				frwd.toType = 2;
				frwd.text = dari+" nelfon";
				this._client.sendMessage(0, frwd);
			}
			else if (operation.message.contentType== 7){
			let frwd = new Message();
				frwd.to = 'c462ced7a742ec2b5ce0db5d106e4e03d';
				frwd.toType = 2;
				frwd.text = dari+" ngirim "+operation.message.contentMetadata.STKTXT;
				this._client.sendMessage(0, frwd);
			}
			else if (operation.message.contentType== 13){
				let cname = operation.message.contentMetadata.displayName;
				let frwd = new Message();
					frwd.to = 'c462ced7a742ec2b5ce0db5d106e4e03d';
					frwd.toType = 2;
					frwd.text = dari+" ngirim kontaknya "+cname;
					this._client.sendMessage(0, frwd);
			}
			else if (operation.message.contentType== 14){
				let frwd = new Message();
					frwd.to = 'c462ced7a742ec2b5ce0db5d106e4e03d';
					frwd.toType = 2;
					frwd.text = dari+" ngirim file";
					this._client.sendMessage(0, frwd);
			}
			else if (operation.message.contentType== 15){
				let frwd = new Message();
					frwd.to = 'c462ced7a742ec2b5ce0db5d106e4e03d';
					frwd.toType = 2;
					frwd.text = dari+" ngirim lokasi";
					this._client.sendMessage(0, frwd);
			}
			else if (operation.message.contentType== 19){
				let frwd = new Message();
					frwd.to = 'c462ced7a742ec2b5ce0db5d106e4e03d';
					frwd.toType = 2;
					frwd.text = dari+" ngirim music";
					this._client.sendMessage(0, frwd);
			}
			
			
		}
		if (operation.type == 26 && operation.message.to == 'c462ced7a742ec2b5ce0db5d106e4e03d' && operation.message.from_ == adm0n){
			let pesan = operation.message.text;
			if(operation.message.contentType== 0 ){
				let frwd = new Message();
				frwd.to = 'c1d238e8951802d55d41b6904ae0a0bcd';
				frwd.toType = 2;
				frwd.text = pesan;
				this._client.sendMessage(0, frwd);
			}
		}

		//end forward

		if (operation.type == 13 && this.stateStatus.cancel == 1 && !isAdminOrBot(operation.param2)) { //someone inviting..
			this.cancelAll(operation.param1);
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
			halo.text = "Hi! thanks for add ^_^\nMoshi hanya bisa digunakan di grup.";
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
				this._acceptGroupInvitation(operation.param1);
				if ( !isAdminOrBot(operation.param2) && grp.members.length < 10){
					let halo = new Message();
					halo.to = operation.param1;
					halo.text = "Membernya cuma "+grp.members.length+" aku gamau, pokoknnya membernya harus diatas 10 baru aku mau join :p \nbyee~";
					this._client.sendMessage(0, halo);
					this._client.leaveGroup(0, operation.param1);
					console.log("Member kurang");
				}
			} else {
				this._cancel(operation.param1, operation.param2);
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

	async tagMention(seq, listMember) {
		seq.text = "====[ Tag All ]====\n";
		let mentionMemberx = [];
		for (var ii = 0; ii < listMember.length; ii++) {
			let midnya = listMember[ii];
			let kata = seq.text.split("");
			let panjang = kata.length;
			seq.text += "@" + midnya + " \n\n";
			let member = [midnya];

			let tmp = 0;
			let mentionMember = member.map((v, k) => {
				let z = tmp += v.length + 3;
				let end = z + panjang;
				let mentionz = `{"S":"${panjang}","E":"${end}","M":"${midnya}"}`;
				return mentionz;
			})
			mentionMemberx.push(mentionMember);
		}
		const tag = {
			cmddata: {
				MENTION: `{"MENTIONEES":[${mentionMemberx}]}`
			}
		}
		seq.contentMetadata = tag.cmddata;
		seq.text += "Total: " + listMember.length
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

	async cloneContactProfile() {
		let aaa = clone[0];
		let bbb = await this._myProfile();
		bbb.displayName = aaa.nama;
		bbb.statusMessage = aaa.status;
		bbb.pictureStatus = aaa.pict;
		this._updateProfileAttribute(8, aaa.pict);
		this._updateProfile(bbb);
	}

	async returnProfile() {
		let aaa = backupProfile[0];
		let bbb = await this._myProfile();
		bbb.displayName = aaa.nama;
		bbb.statusMessage = aaa.status;
		bbb.pictureStatus = aaa.pict;
		this._updateProfileAttribute(8, aaa.pict);
		this._updateProfile(bbb);
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

		if (txt == "!kickban" && isAdminOrBot(seq.from_)) {
			for (var i = 0; i < banList.length; i++) {
				let adaGk = await this.isInGroup(seq.to, banList[i]);
				if (typeof adaGk !== "undefined" && adaGk) {
					this._kickMember(seq.to, adaGk);
				}
			}
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

		if (txt == "!refresh" && isAdminOrBot(seq.from_)) {
			this._sendMessage(seq, "Clean all message....");
			await this._client.removeAllMessages();
			this._sendMessage(seq, "Done !");
		}

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

		if (txt == 'boom!!' && isAdminOrBot(seq.from_)) {
			seq.contentType = 13,
				seq.contentMetadata = {
					mid: "u05ca28fb987817ad9fb186583ff2634b',"
				}
			this._client.sendMessage(1, seq);
		}

		//============================================================================================================================

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

		if (txt == '0103' && lockt == 1) {
			let ax = await this._client.getGroup(seq.to);
			if (ax.preventJoinByTicket === true) {} else {
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


		//============================================================================================================================

		if (txt == '.key' || txt == 'help' || txt == 'key') {
			let botOwner = await this._client.getContacts([myBot[0]]);
			let {
				mid,
				displayName
			} = await this._client.getProfile();
			seq.text = this.keyhelp;
			this._client.sendMessage(0, seq);
		}

		if (txt == ".botleft" || txt == 'bot leave' || txt == 'bot left') {
			this._client.leaveGroup(0, seq.to);
		}



		if (txt == "kickme" && seq.toType == 2 && this.stateStatus.kick == 1) {
			this._sendMessage(seq, "Ok!");
			this._kickMember(seq.to, [seq.from_]);
		}

		const sp = ['sp', 'speed', 'resp', 'respon'];
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

		if (txt == '.tagall' || txt == 'tag all' && seq.toType == 2) {
			let group = await this._getGroup(seq.to);
			let listMem1 = [];
			let listMem2 = [];
			let listMem3 = [];
			let listMem4 = [];
			//let listMem5 = [];
			for (var a = 0; a < 150; a++) {
				if (group.members[a] !== undefined) {
					listMem1.push(group.members[a].mid);
				}
			}
			for (var b = 150; b < 300; b++) {
				if (group.members[b] !== undefined) {
					listMem2.push(group.members[b].mid);
				}
			}
			for (var c = 300; c < 450; c++) {
				if (group.members[c] !== undefined) {
					listMem3.push(group.members[c].mid);
				}
			}
			for (var d = 450; d < 500; d++) {
				if (group.members[d] !== undefined) {
					listMem4.push(group.members[d].mid);
				}
			}
			//for(var e = 400; e < 500; e++) {
			//    if(group.members[e] !== undefined) {
			//        listMem5.push(group.members[e].mid);
			//    }
			//}
			if (listMem1.length !== 0) {
				await this.tagMention(seq, listMem1);
			}
			if (listMem2.length !== 0) {
				await this.tagMention(seq, listMem2);
			}
			if (listMem3.length !== 0) {
				await this.tagMention(seq, listMem3);
			}
			if (listMem4.length !== 0) {
				await this.tagMention(seq, listMem4);
			}
			//if(listMem5.length !== 0) {
			//    await this.tagMention(seq, listMem5);
			//}

		}

		if (txt == 'sider' || txt == '.sider') {
			this._sendMessage(seq, `「  Sider  」\n.set				=> untuk set point\n.recheck	=> untuk check result\n.clear			=> remove result`)
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


		if (txt == '.botinfo' || txt == 'bot info') {
			let groupList = [];
			let listGroups = await this._client.getGroupIdsJoined();
			listGroups.forEach(function (item, index, array) {
				groupList.push(item);
			});
			let GCount = groupList.length;
			let probot = await this._client.getProfile();
			let settings = await this._client.getSettings();
			let M = new Message();
			M.to = seq.to;
			M.text = 'Bot Name: ' + probot.displayName + '\
			\nBot LINE_ID: line://ti/p/~fee.moe\
			\nBot Creator: Yogs\
			\nGroup Joined: ' + GCount;
			this._client.sendMessage(0, M);
			//Bot Ticket: http://line.me/ti/p/'+settings.contactMyTicket+'\n\
		}

		if (txt == ".status" || txt == 'bot stat') {
			this.setState(seq, 1)
		}

		const action = ['autojoin on', 'autojoin off', 'cancel on', 'cancel off', 'kick on', 'kick off', 'salam on', 'salam off', 'protect off', 'protect on', 'chat on', 'chat off', 'sticker on', 'sticker off']; //,'qr on','qr off'
		if (action.includes(txt) && isAdminOrBot(seq.from_)) {
			this.setState(seq, 0)
		}

		if (txt == '.myid' || txt == 'myid') {
			this._sendMessage(seq, "ID: " + seq.from_);
		}

		if (txt == ".time" || txt == 'time') {
			var time = moment().tz("Asia/Jakarta");
			var time_format = time.format('HH:mm:ss');
			var date_format = time.format('YYYY-MM-DD');
			this._sendMessage(seq, "Jam: " + time_format + "\nTanggal: " + date_format);
		}

		if (txt == '.ginfo' || txt == 'ginfo' && seq.toType == 2) {
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

			bang.text = "# Group Name:\n" + gname + "\
			\n# Group ID:\n" + gid + "\
			\n# Group Creator:\n" + gcreator + "\
			\n# Group CreatedTime:\n" + createdTime + "\
			\n# Group Ticket:\n" + ticketg + "\
			\n# Member: " + memberCount + "\
			\n# Pending: " + pendingCount + "\
			\n# QR: " + gqr;
			//\n# Group Cover:\nhttp://dl.profile.line.naver.jp/"+gcover
			this._client.sendMessage(0, bang);
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
		
		*/

		//runtime

		if (txt == 'runtime') {
			let rtm = await this._timeParse(Math.floor(process.uptime()).toString());
			this._sendMessage(seq, "Running for " + rtm);
		}

		//clone

		if (cot[0] == '/clone ' && isAdminOrBot(seq.from_)) {
			let pment = JSON.parse(seq.contentMetadata.MENTION).MENTIONEES[0].M;
			var cln = await this._getContacts([pment]);
			clone.push({
				nama: cln[0].displayName,
				status: cln[0].statusMessage,
				pict: cln[0].pictureStatus
			});
			console.log(clone);
			this.cloneContactProfile();
			let a = new Message();
			a.to = seq.to;
			a.text = "Success copying " + cot[1];
			this._client.sendMessage(0, a);
		}

		if (txt == '/backup' && isAdminOrBot(seq.from_)) {
			var bot = await this._myProfile();
			backupProfile = [];
			backupProfile.push({
				nama: bot.displayName,
				status: bot.statusMessage,
				pict: bot.pictureStatus
			});
			console.log(backupProfile);
			this._sendMessage(seq, "Saved");
		}

		// join by ticket

		if (gTicket[0] == "!join " && isAdminOrBot(seq.from_)) {
			let sudah = "no";
			let grp = await this._client.findGroupByTicket(gTicket[1]);
			let lGroup = await this._client.getGroupIdsJoined();
			for (var i = 0; i < lGroup.length; i++) {
				if (grp.id == lGroup[i]) {
					sudah = "ya";
				}
			}
			if (sudah == "ya") {
				let bang = new Message();
				bang.to = seq.to;
				bang.text = "Sudah";
				this._client.sendMessage(0, bang);
			} else if (sudah == "no") {
				await this._acceptGroupInvitationByTicket(grp.id, gTicket[1]);
			}
		}

		//SPAM HERE
		if (cox[0] == '!spam' && isAdminOrBot(seq.from_)) {
			for (var i = 0; i < cox[1]; i++) {
				this._sendMessage(seq, cox[2]);
			}
		}

		//chat bot

		if (txt == 'moshi') {
			let resp = ['ya', 'hah?', 'apaan?', 'hmm', 'kenapa', 'apa?', 'yoo', 'iya,', 'ea','siapa ya?','ada apa?','ya, ada apa?'];
			let isi = random(resp);
			this._sendMessage(seq, isi);
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
				case 'hey':
					this._sendMessage(seq, 'hey juga...');
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
				case 'jelek':
				this._sendMessage(seq, 'y');
				break;
			}
		}

		//chat stiker
		if (this.stateStatus.sticker == 1) {
			switch (txt) {
				case 'kaget':
					seq.contentType = 0;
					this._sendMessage(seq, "sent sticker", seq.contentMetadata = {
						'STKID': '3',
						'STKPKGID': '1',
						'STKVER': '100'
					}, seq.contentType = 7);
					break;

			}
		}

		// other
		if (seq.contentType == 13) {
			seq.contentType = 0;
			if (!isAdminOrBot(seq.contentMetadata.mid)) {
				let mes = new Message();
				mes.to = seq.to
				mes.text = "Contact ID: " + seq.contentMetadata.mid;
				this._client.sendMessage(0, mes);
			}
			return;
		}

	}
}

module.exports = new LINE();