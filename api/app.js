import "dotenv/config";
import express from "express";
import cors from "cors";

import rotaBoia from "./routes/rotaBoia.js";
import rotaSolo from "./routes/rotaSolo.js";
import rotaDHT from "./routes/rotaDHT.js";
import rotaRele from "./routes/rotaRele.js";
import rotaBomba from "./routes/rotaBomba.js";

import {
    onMessage,
    TOPICO_NIVEL_BOIA,
    TOPICO_UMIDADE_SOLO,
    TOPICO_TEMPERATURA,
    TOPICO_UMIDADE_AR,
    TOPICO_BOMBA,
    TOPICO_STATUS,
} from "./services/mqttClient.js";

import { BD } from "./bd.js";

const app = express();

app.use(cors());
app.use(express.json());


// ==================================================
// ROTA INICIAL
// ==================================================

app.get("/", (req, res) => {
    return res.json("Api NO AR");
});


// ==================================================
// ROTAS INDIVIDUAIS
// ==================================================

app.use("/controleBoia", rotaBoia);
app.use("/controleSolo", rotaSolo);
app.use("/controleDHT", rotaDHT);
app.use("/controleRele", rotaRele);
app.use("/controleBomba", rotaBomba);


// ==================================================
// DADOS ATUAIS DA ESTUFA
// ==================================================

const dadosSensores = {
    temperatura: null,
    umidadeAr: null,
    umidadeSolo: null,
    nivelBoia: null,
    statusBomba: null,
    statusRele: null,
};


// ==================================================
// SALVAR SENSORES NO BANCO
// ==================================================

const salvarDadosSensores = async () => {

    try {

        await BD.query(
            `
            INSERT INTO dados_sensores
            (
                temperatura,
                umidade_ar,
                umidade_solo,
                nivel_boia
            )
            VALUES ($1, $2, $3, $4)
            `,
            [
                dadosSensores.temperatura,
                dadosSensores.umidadeAr,
                dadosSensores.umidadeSolo,
                dadosSensores.nivelBoia,
            ]
        );

        console.log("Dados dos sensores salvos no BD");

    } catch (error) {

        console.error(
            "Erro ao salvar dados dos sensores no BD:",
            error.message
        );

    }
};


// ==================================================
// FUNÇÃO PARA ATUALIZAR SENSOR
// ==================================================

const atualizarSensor = (
    campo,
    valor,
    numerico = true
) => {

    const valorConvertido = numerico
        ? Number(valor.replace(",", "."))
        : valor;

    if (
        numerico &&
        !Number.isFinite(valorConvertido)
    ) {

        console.error(
            `Valor inválido recebido para ${campo}: ${valor}`
        );

        return;
    }

    dadosSensores[campo] = valorConvertido;

    console.log(
        `${campo} atualizado:`,
        valorConvertido
    );

    salvarDadosSensores();
};


// ==================================================
// MQTT - TEMPERATURA
// ==================================================

onMessage(
    TOPICO_TEMPERATURA,
    (mensagem) => {

        atualizarSensor(
            "temperatura",
            mensagem
        );

    }
);


// ==================================================
// MQTT - UMIDADE DO AR
// ==================================================

onMessage(
    TOPICO_UMIDADE_AR,
    (mensagem) => {

        atualizarSensor(
            "umidadeAr",
            mensagem
        );

    }
);


// ==================================================
// MQTT - UMIDADE DO SOLO
// ==================================================

onMessage(
    TOPICO_UMIDADE_SOLO,
    (mensagem) => {

        atualizarSensor(
            "umidadeSolo",
            mensagem
        );

    }
);


// ==================================================
// MQTT - NÍVEL DA BOIA
// ==================================================

onMessage(
    TOPICO_NIVEL_BOIA,
    (mensagem) => {

        atualizarSensor(
            "nivelBoia",
            mensagem,
            false
        );

    }
);


// ==================================================
// MQTT - BOMBA
// ==================================================

onMessage(
    TOPICO_BOMBA,
    (mensagem) => {

        atualizarSensor(
            "statusBomba",
            mensagem,
            false
        );

    }
);


// ==================================================
// MQTT - RELÉ / LED
// ==================================================

onMessage(
    TOPICO_STATUS,
    (mensagem) => {

        atualizarSensor(
            "statusRele",
            mensagem,
            false
        );

    }
);


// ==================================================
// MONITORAMENTO GERAL DA ESTUFA
// ==================================================

app.get(
    "/monitoramento",
    (req, res) => {

        return res
            .status(200)
            .json(dadosSensores);

    }
);


// ==================================================
// HISTÓRICO
// ==================================================

app.get(
    "/historico/dados",
    async (req, res) => {

        try {

            const result = await BD.query(
                `
                SELECT *
                FROM dados_sensores
                ORDER BY data_hora DESC
                LIMIT 15
                `
            );

            return res
                .status(200)
                .json(
                    result.rows.reverse()
                );

        } catch (error) {

            return res
                .status(500)
                .json({
                    error: error.message
                });

        }

    }
);


// ==================================================
// INICIAR SERVIDOR
// ==================================================

const porta = 3000;

app.listen(
    porta,
    () => {

        console.log(
            `Servidor funcionando http://localhost:${porta}`
        );

    }
);