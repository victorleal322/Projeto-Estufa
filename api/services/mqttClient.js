import "dotenv/config";
import mqtt from "mqtt";

// ========================================
// CONFIGURAÇÕES DO BROKER
// ========================================

const MQTT_BROKER_HOST = process.env.MQTT_BROKER_HOST;
const MQTT_BROKER_PORT = Number(
  process.env.MQTT_BROKER_PORT || 8883
);

const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

// ========================================
// TÓPICOS
// ========================================

const TOPICO_STATUS = "aula/30/status";
const TOPICO_NIVEL_BOIA = "aula/30/nivelBoia";
const TOPICO_UMIDADE_SOLO = "aula/30/umidadeSolo";
const TOPICO_TEMPERATURA = "aula/30/temperatura";
const TOPICO_UMIDADE_AR = "aula/30/umidadeAr";
const TOPICO_ESTADO_LED = "aula/30/estadoLed";
const TOPICO_BOMBA = "aula/30/bomba";

let mqttClient = null;

const subscriptions = {};

// ========================================
// CONEXÃO MQTT
// ========================================

function conectarMqtt() {

  if (mqttClient?.connected) {
    return;
  }

  console.log("MQTT: tentando conectar...");

  console.log("MQTT host configurado:", !!MQTT_BROKER_HOST);
  console.log("MQTT usuário configurado:", !!MQTT_USERNAME);
  console.log("MQTT senha configurada:", !!MQTT_PASSWORD);
  console.log("MQTT porta:", MQTT_BROKER_PORT);

  mqttClient = mqtt.connect({
    host: MQTT_BROKER_HOST,
    port: MQTT_BROKER_PORT,

    protocol: "mqtts",

    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,

    connectTimeout: 30_000,

    // tenta novamente a cada 5 segundos
    reconnectPeriod: 5_000,

    // necessário para conexão TLS
    rejectUnauthorized: true,

    clean: true,
  });

  // ========================================
  // CONECTOU
  // ========================================

  mqttClient.on("connect", () => {

    console.log("✅ MQTT: conectado!");

    const topicos = [
      TOPICO_STATUS,
      TOPICO_NIVEL_BOIA,
      TOPICO_UMIDADE_SOLO,
      TOPICO_TEMPERATURA,
      TOPICO_UMIDADE_AR,
      TOPICO_BOMBA,
    ];

    mqttClient.subscribe(topicos, (error) => {

      if (error) {
        console.error(
          "❌ MQTT: erro ao se inscrever:",
          error.message
        );

        return;
      }

      console.log(
        `✅ MQTT: inscrito em ${topicos.length} tópicos`
      );
    });
  });

  // ========================================
  // RECEBEU MENSAGEM
  // ========================================

  mqttClient.on("message", (topic, message) => {

    const mensagem = message.toString();

    console.log(
      `📡 MQTT recebeu ${topic}: ${mensagem}`
    );

    if (subscriptions[topic]) {
      subscriptions[topic](mensagem);
    }
  });

  // ========================================
  // ERROS
  // ========================================

  mqttClient.on("error", (error) => {

    console.error(
      "❌ MQTT: erro:",
      error.message
    );
  });

  mqttClient.on("close", () => {

    console.log(
      "⚠️ MQTT: conexão fechada"
    );
  });

  mqttClient.on("reconnect", () => {

    console.log(
      "🔄 MQTT: tentando reconectar..."
    );
  });

  mqttClient.on("offline", () => {

    console.log(
      "⚠️ MQTT: cliente offline"
    );
  });
}

// ========================================
// CALLBACKS DOS TÓPICOS
// ========================================

function onMessage(topic, callback) {

  subscriptions[topic] = callback;
}

// ========================================
// PUBLICAR
// ========================================

function publicar(topic, message) {

  return new Promise((resolve, reject) => {

    if (!mqttClient?.connected) {

      return reject(
        new Error("Cliente MQTT não conectado")
      );
    }

    mqttClient.publish(
      topic,
      message,
      { retain: true },

      (error) => {

        if (error) {
          return reject(error);
        }

        console.log(
          `📤 MQTT publicou ${topic}: ${message}`
        );

        resolve();
      }
    );
  });
}

// ========================================
// INICIA CONEXÃO
// ========================================

conectarMqtt();

// ========================================
// EXPORTAÇÕES
// ========================================

export {
  onMessage,
  publicar,

  TOPICO_STATUS,
  TOPICO_NIVEL_BOIA,
  TOPICO_UMIDADE_SOLO,
  TOPICO_TEMPERATURA,
  TOPICO_UMIDADE_AR,
  TOPICO_ESTADO_LED,
  TOPICO_BOMBA,
};