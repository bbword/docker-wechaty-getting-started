/**
 *   Wechaty - https://github.com/chatie/wechaty
 *
 *   @copyright 2016-2018 Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
import {
  Wechaty,
}           from 'wechaty'

import qrTerm from 'qrcode-terminal'

/**
 *
 * 1. Declare your Bot!
 *
 */
const bot = new Wechaty({
  name : 'javascript-es6',
})

let slots={};
let works={};
/**
 *
 * 2. Register event handlers for Bot
 *
 */
bot
.on('login',  onLogin)
.on('scan',   onScan)
.on('error',  onError)
.on('message', onMessage)

/**
 *
 * 3. Start the bot!
 *
 */
bot.start()
.catch(async e => {
  console.error('Bot start() fail:', e)
  await bot.stop()
  process.exit(-1)
})

/**
 *
 * 4. You are all set. ;-]
 *
 */

/**
 *
 * 5. Define Event Handler Functions for:
 *  `scan`, `login`, `logout`, `error`, and `message`
 *
 */
function onScan (qrcode, status) {
  qrTerm.generate(qrcode, { small: true })

  // Generate a QR Code online via
  // http://goqr.me/api/doc/create-qr-code/
  const qrcodeImageUrl = [
    'https://api.qrserver.com/v1/create-qr-code/?data=',
    encodeURIComponent(qrcode),
  ].join('')

  console.log(`[${status}] ${qrcodeImageUrl}\nScan QR Code above to log in: `)
}

function onLogin (user) {
  console.log(`${user.name()} login`)
  bot.say('Wechaty login').catch(console.error)
}

function onError (e) {
  console.error('Bot error:', e)
}

/**
 *
 * 6. The most important handler is for:
 *    dealing with Messages.
 *
 */
async function onMessage (msg) {
  let room=msg.room();
  if(room){
    let topic=await room.topic();
    if(topic!=='test' && topic!=='我爱二（5）班') {
      return
    }
    console.log(msg.toString())
    let msgText = msg.text();
    if(msg.type()===bot.Message.Type.Text && /^接龙\|.+\|.+$/i.test(msgText)){
      let msgArr = msgText.split('|');
      if(msgArr[2]==='开始'){
        slots[msgArr[1]]={}
      }else if(msgArr[2]==='删除'){
        delete slots[msgArr[1]]
      }else{
        let nameArr=msgArr[2].split(':')
        if(nameArr.length!=2) return
        if(nameArr[1]==='删除'){
          delete slots[msgArr[1]][nameArr[0]]
        }else {
          slots[msgArr[1]][nameArr[0]]=nameArr[1]
        }
      }

      let replyText=msgArr[1]+":\n";
      let i=0;
      for(let name in slots[msgArr[1]]){
        i++;
        replyText+=(i+'、'+name+' '+slots[msgArr[1]][name]+'\n');
      }
      await  room.say(replyText);
    }
    if(msg.type()===bot.Message.Type.Text && /^作业\|\d{4}-\d{2}-\d{2}\|.+$/i.test(msgText)){
      let msgArr = msgText.split('|');
      works[msgArr[1]]=msgArr[2];
      await  room.say('作业已添加或修改')
    }

    if(msg.type()===bot.Message.Type.Text && /^作业\|\d{4}-\d{2}-\d{2}$/i.test(msgText)){
      let msgArr = msgText.split('|');
      await  room.say(msgArr[1]+'的作业是：'+works[msgArr[1]])
    }
  }

}
