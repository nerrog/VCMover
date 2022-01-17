const { Client, Intents } = require("discord.js");
const client = new Client({ intents: Object.keys(Intents.FLAGS) });

// Development Flag
const IsDev = false;

//Configロード
var config;
if (IsDev) {
  config = require("./devconfig.json");
} else {
  config = require("./config.json");
}
//configチェック
if (!config.token) {
  console.log("tokenが設定されていません");
  process.exit(1);
} else if (!config.server) {
  console.log("serverが設定されていません");
  process.exit(1);
} else if (!config.roll) {
  console.log("rollが設定されていません");
  process.exit(1);
}

//開始処理
client.on("ready", async () => {
  const command_data = [
    {
      name: "move_vc",
      description:
        "コマンドを送信したユーザーが入っているVC内のユーザー全員を指定のVCに移動させます",
      options: [
        {
          type: "CHANNEL",
          channelTypes: ["GUILD_VOICE"],
          name: "ボイスチャンネル",
          description: "移動先のボイスチャンネル",
          required: true,
        },
      ],
    },
  ];

  await client.application.commands.set(command_data, config.server);
  await client.user.setActivity("/move_vc", { type: "LISTENING" });
  console.log(`Logined as ${client.user.tag}`);
});

//スラッシュコマンドの処理部
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  if (interaction.commandName === "move_vc") {
    //ロールのチェック
    if (interaction.member._roles.indexOf(config.roll) == -1) {
      await interaction.reply({
        content: "これを操作する権限がありません!",
        ephemeral: true,
      });
      return;
    }
    //チャンネルの取得
    const target_channel = interaction.options.getChannel("ボイスチャンネル");
    const current_channel = interaction.member.voice.channel;

    //チェック
    if (current_channel == null) {
      await interaction.reply({
        content: "ボイスチャンネルに入っていません!",
        ephemeral: true,
      });
      return;
    } else if (current_channel.id == target_channel.id) {
      await interaction.reply({
        content: "移動先と現在のチャンネルが同じです!",
        ephemeral: true,
      });
      return;
    }

    //移動
    await interaction.reply("メンバーを移動しています...");

    const move_members = [];
    await current_channel.members.forEach(async (member) => {
      member.voice.setChannel(target_channel);
      move_members.push(member.user.username);
    }, this);

    await interaction.editReply(
      "以下のメンバーを" +
        "<#" +
        target_channel.id +
        ">" +
        "に移動しました!\n" +
        move_members.join("、")
    );
  }
});

//ログイン
client.login(config.token);
