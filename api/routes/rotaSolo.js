import { Router } from "express";
import { onMessage, TOPICO_UMIDADE_SOLO } from "../services/mqttClient.js";

const router = Router();
let umidadeSolo = "Desconhecido";

onMessage(TOPICO_UMIDADE_SOLO, (mensagem) => {
    umidadeSolo = mensagem;
    console.log(`Mensagem recebida no ${TOPICO_UMIDADE_SOLO}: ${umidadeSolo}`);
});

router.get('/umidade', async (req, res) => {
    try {
        let status = "Desconhecido";
        const valor = Number(umidadeSolo);

        if (!isNaN(valor)) {
            if (valor <= 25) {
                status = "Baixo";
            } else if (valor <= 50) {
                status = "Médio";
            } else if (valor <= 75) {
                status = "Alto";
            } else {
                status = "Muito alto";
            }
        }

        console.log(`Status solo: ${status}`);
        console.log(`umidade solo: ${umidadeSolo}`);

        return res.status(200).json({
            umidadeSolo,
            status
        });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao obter dados' });
    }
});

export default router