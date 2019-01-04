String.prototype.clr = function (hexColor) { return `<font color='#${hexColor}'>${this}</font>` };
const Vec3 = require('tera-vec3');

const MapID = 9044;
const ZoneID = 444;
const TemplateID = [1000, 2000];
const {BossActionsTips} = require('./skillsList');
const BossName = ['Entrance', '1st Phase', '2nd Phase'];

module.exports = function BaharrGuide(mod) {
	let	enabled = true,
		sendToAlert = true,
		sendToNotice = true,
		sendToMessage = true,
		
		isTank = true,
		insidemap = true,
		checkBoss = true,
		whichboss = 0,
		bossId = 0n,
		
		hooks = [],
		
		boss_CurLocation = null,
		boss_CurAngle = null,
		
		curLocation = null,
		curAngle = null,
		
		skill = null,
		skillid = null,
		
		shining = false,
		
		uid0 = 999999999n,
		uid1 = 899999999n,
		uid2 = 799999999n,
		
		itemID = 553,
		timeOut = 0;
	
	mod.command.add(['巴哈', 'baha'], (arg) => {
		if (!arg) {
			enabled = !enabled;
			sendMessage('辅助提示 ' + (enabled ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
		} else {
			switch (arg) {
				case "a":
				case "alert":
				case "警告":
					sendToAlert = !sendToAlert;
					sendMessage('警告通知 ' + (sendToAlert ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					break;
				case "n":
				case "notice":
				case "队长":
					sendToNotice = !sendToNotice;
					sendMessage('队长通知 ' + (sendToNotice ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					break;
				case "p":
				case "proxy":
				case "代理":
					sendToMessage = !sendToMessage;
					sendMessage('代理通知 ' + (sendToMessage ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					break;
				case "debug":
					sendMessage('模块开关: ' + `${enabled}`.clr('00FFFF'));
					sendMessage('副本地图: ' + insidemap);
					sendMessage('副本首领: ' + whichboss);
					sendMessage('警告通知 ' + (sendToAlert ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					sendMessage('队长通知 ' + (sendToNotice ? '启用'.clr('56B4E9') : '禁用'.clr('E69F00')));
					sendMessage('职业分类 ' + (isTank ? '坦克'.clr('00FFFF') : '打手'.clr('FF0000')));
					alertMessage('alertMessageTEST');
					noticeMessage('noticeMessageTEST');
					break;
				case "test1":
					TEST1();
					break;
				case "test2":
					TEST2();
					break;
				default :
					sendMessage('无效的参数!'.clr('FF0000'));
					break;
			}
		}
	});
	
	mod.hook('S_LOGIN', 12, (event) => {
		let job = (event.templateId - 10101) % 100;
		if (job === 1 || job === 10) {					// 0-双刀, 1-枪骑, 2-大剑, 3-斧头, 4-魔道
			isTank = true;								// 5-弓箭, 6-祭司, 7-元素, 8-飞镰, 9-魔工
		} else {										// 10-拳师, 11-忍者 12 月光
			isTank = false;
		}
	});
	
	mod.hook('S_LOAD_TOPO', 3, (event) => {
		if (event.zone === MapID) {
			sendMessage('Welcome to: ' + 'Bahaar\'s Rectum '.clr('56B4E9') + `${BossName[whichboss]}`.clr('FF0000'));
			insidemap = true;
			checkBoss = true;
			load();
		} else {
			insidemap = false;
			checkBoss = false;
			whichboss = 0;
			shining = false;
			clearInterval(timeOut);
			unload();
		}
    });
	
	function load() {
		if (!hooks.length) {
			hook('S_BOSS_GAGE_INFO', 3, sBossGageInfo);
			hook('S_ACTION_STAGE', 8, sActionStage);
			hook('S_ABNORMALITY_BEGIN', 3, sAbnormalityBegin);
			
			function sBossGageInfo(event) {
				if (!enabled || !insidemap || !checkBoss) return;
				
				if (event.templateId === TemplateID[0]) {
					whichboss = 1;
				} else if (event.templateId === TemplateID[1]) {
					whichboss = 2;
				} else {
					whichboss = 0;
				}
				bossId = event.id;
				checkBoss = false;
			}
			
			function sActionStage(event) {
				if (!enabled || !insidemap) return;
				
				if (event.stage > 0) return;
				
				/* if (event.templateId == 2201) {
					if (event.skill.id == 1205) {
						setTimeout(() => { noticeMessage('|| 小怪已苏醒 ||'.clr('FF0000')) }, 30000);
					}
				} */
				
				if (event.templateId == 2500) {
					curLocation = event.loc;
					curAngle = event.w;
					
					skill = event.skill.id % 1000;
					/* if (skill == 201) {
						noticeMessage('红眼射线 (小心)');
						return;
					} */
					if (skill == 305) {
						noticeMessage('<font color="#FF0000">Red eye ray (second kill)</font>');
						Spawnitem1(537, 180, 3000, 6000);
						return;
					}
				}
				
				if (!(TemplateID.includes(event.templateId))) return;
				
				boss_CurLocation = event.loc;
				boss_CurAngle = event.w;
				curLocation = boss_CurLocation;
				curAngle = boss_CurAngle;
				skillid = event.skill.id % 1000;
				
				if (BossActionsTips[skillid]) { noticeMessage(BossActionsTips[skillid].msg); }
				
				switch (skillid) {
					case 103:	// 前砸
					case 125:	// 右前砸+后拉
						SpawnThing(true, 184, 400, 100);
						Spawnitem2(itemID, 8, 350, 3000);
						break;
						
					case 131:	// 左前砸+后拉
						SpawnThing(true, 182, 340, 100);
						Spawnitem2(itemID, 8, 660, 4000);
						break;
						
					case 112:	// 完美格挡
					case 135:
						SpawnThing(true, 184, 220, 100);
						Spawnitem2(itemID, 12, 210, 4000);
						break;
						
					case 114:	// 捶地
						SpawnThing(true, 184, 260, 100);
						Spawnitem2(itemID, 10, 320, 4000);
						break;
						
					case 116:	// 点名后甜甜圈
						Spawnitem2(itemID, 8, 290, 6000);
						break;
						
					case 111:	// 后砸 (慢慢慢慢)
					case 137:	// 后砸
						SpawnThing(true, 0, 500, 100);
						Spawnitem2(itemID, 8, 480, 2000);
						break;
						
					case 121:	// 左脚→(4连火焰)
					case 122:
					case 123:
					case 140:	// 右脚←(4连火焰)
					case 141:
					case 142:
						SpawnThing(true, 90, 50, 100);
						Spawnitem1(itemID, 180, 500, 6000);
						Spawnitem1(itemID, 0, 500, 6000);
						
						SpawnThing(true, 270, 100, 100);
						Spawnitem1(itemID, 180, 500, 6000);
						Spawnitem1(itemID, 0, 500, 6000);
						
						timeOut = setTimeout(() => {
							alertMessage('Waves soon...')
							mod.send('S_CHAT', 2, {
								channel: 25,
								authorName: 'Guide',
								message: 'Waves soon...'
							});
						}, 60000);
						break;
						
					case 101:	// 锤地(三连击)
						Spawnitem1(itemID, 345, 500, 4000);	// 对称轴 尾部
						Spawnitem1(itemID, 270, 500, 3000);	// 对称轴 左侧
						break;
						
					case 311:	// 右手放锤
					case 312:	// 左右放锤
						Spawnitem1(itemID, 180, 500, 6000);	// 对称轴 头部
						Spawnitem1(itemID, 0, 500, 6000);	// 对称轴 尾部
						break;
						
					case 119:	// 光柱+告示牌
						SpawnThing(false, 270, 300, 2000);
						break;
					case 120:
						SpawnThing(false, 90, 300, 2000);
						break;
						
					default :
						break;
				}
			}
			
			function sAbnormalityBegin(event) {
				if (Number(event.target) != Number(bossId)) return;
				
				if (event.id == 90442304) noticeMessage('Stop the Boss using [Stun] skill');
				
				if (event.id == 90442000) shining = true;
				if (event.id == 90442001) shining = false;
				
				if (event.id == 90444001 && skillid == 104) setTimeout(() => { if (shining) noticeMessage('back hammer') } , 500);
				if (event.id == 90442000 && skillid == 134) setTimeout(() => { if (shining) noticeMessage('back hammer') } , 300);
				if (event.id == 90444001 && skillid == 118) setTimeout(() => { if (shining) noticeMessage('back hammer ') } , 300);
			}
		}
	}
	
	function hook() {
		hooks.push(mod.hook(...arguments));
	}
	
	function unload() {
		if (hooks.length) {
			for (let h of hooks)
				mod.unhook(h);
			hooks = [];
		}
	}
	
	function alertMessage(msg) {
		if (sendToAlert) {
			mod.send('S_DUNGEON_EVENT_MESSAGE', 2, {
				type: 43,
				chat: 0,
				channel: 0,
				message: msg
			});
		}
	}
	
	function noticeMessage(msg) {
		if (sendToNotice) {
			mod.send('S_CHAT', 2, {
				channel: 21,
				authorName: 'Guide',
				message: msg
			});
		}
	}
	
	function sendMessage(msg) {
		mod.command.message(msg);
	}
	
	function TEST1() {
		mod.send('S_SPAWN_BUILD_OBJECT', 2, {
			gameId : 222222222n,
			itemId : 1,
			loc : new Vec3(-114567, 115063, 4022),
			w : 3,
			unk : 0,
			ownerName : 'throne',
			message : 'throne direction'
		});
	}
	
	function TEST2() {
		mod.send('S_DESPAWN_BUILD_OBJECT', 2, {
			gameId : 222222222n,
			unk : 0
		});
	}
	
	function SpawnThing(hide, degrees, radius, times) {
		let r = null, rads = null, finalrad = null;
		
		r = curAngle - Math.PI;
		rads = (degrees * Math.PI/180);
		finalrad = r - rads;
		curLocation.x = boss_CurLocation.x + radius * Math.cos(finalrad);
		curLocation.y = boss_CurLocation.y + radius * Math.sin(finalrad);
		
		mod.send('S_SPAWN_BUILD_OBJECT', 2, {
			gameId : uid1,
			itemId : 1,
			loc : curLocation,
			w : r,
			unk : 0,
			ownerName : 'Guide',
			message : 'Safety Zone'
		});
		
		if (hide) { curLocation.z = curLocation.z - 1000; }
		mod.send('S_SPAWN_DROPITEM', 6, {
			gameId: uid2,
			item: 98260,
			loc: curLocation,
			amount: 1,
			expiry: 600000,
			owners: [{
				id: 0
			}]
		});
		if (hide) { curLocation.z = curLocation.z + 1000; }
		
		setTimeout(DespawnThing, times, uid1, uid2);
		uid1--;
		uid2--;
	}
	
	function DespawnThing(uid_arg1, uid_arg2) {
		mod.send('S_DESPAWN_BUILD_OBJECT', 2, {
			gameId : uid_arg1,
			unk : 0
		});
		mod.send('S_DESPAWN_DROPITEM', 4, {
			gameId: uid_arg2
		});
	}
	
	function Spawnitem(item, degrees, radius, times) {
		let r = null, rads = null, finalrad = null, spawnx = null, spawny = null, pos = null;
		
		r = curAngle - Math.PI;
		rads = (degrees * Math.PI/180);
		finalrad = r - rads;
		spawnx = curLocation.x + radius * Math.cos(finalrad);
		spawny = curLocation.y + radius * Math.sin(finalrad);
		pos = {x:spawnx, y:spawny};
		
		mod.send('S_SPAWN_COLLECTION', 4, {
			gameId : uid0,
			id : item,
			amount : 1,
			loc : new Vec3(pos.x, pos.y, curLocation.z),
			w : r,
			unk1 : 0,
			unk2 : 0
		});
		
		setTimeout(Despawn, times, uid0);
		uid0--;
	}
	
	function Despawn(uid_arg0) {
		mod.send('S_DESPAWN_COLLECTION', 2, {
			gameId : uid_arg0
		});
	}
	
	function Spawnitem1(item, degrees, maxRadius, times) {
		for (var radius=50; radius<=maxRadius; radius+=50) {
			Spawnitem(item, degrees, radius, times);
		}
	}
	
	function Spawnitem2(item, intervalDegrees, radius, times) {
		for (var degrees=0; degrees<360; degrees+=intervalDegrees) {
			Spawnitem(item, degrees, radius, times);
		}
	}
	
	this.destructor = () => { mod.command.remove(['巴哈', 'baha']) }
}
