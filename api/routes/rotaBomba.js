import { Router } from "express";
import { onMessage, TOPICO_BOMBA } from "../services/mqttClient.js";

const router = Router();

import { BD } from '../bd.js';

let statusBomba = "Aguardando...";

onMessage(TOPICO_BOMBA, async (mensagem) => {
    statusBomba = mensagem;
    console.log(`Mensagem recebida no ${TOPICO_BOMBA}: ${statusBomba}`);
    try {
        await BD.query(
            "INSERT INTO estado_atuadores (nome_atuador, estado) VALUES ('Bomba', $1)",
            [mensagem]
        );
    } catch (error) {
        console.error('Erro ao salvar estado da bomba no BD:', error.message);
    }
});

router.get('/status', async (req, res) => {
    try {
        const ligada = statusBomba.toLowerCase().includes('ligada');

        return res.status(200).json({
            statusBomba,
            bombaLigada: ligada,
        });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao obter dados da bomba' });
    }
});

export default router