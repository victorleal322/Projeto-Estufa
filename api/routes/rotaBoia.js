import { Router } from "express";
import { onMessage, TOPICO_NIVEL_BOIA } from "../services/mqttClient.js";

const router = Router();

let nivelBoia = "Desconhecido";

onMessage(TOPICO_NIVEL_BOIA, (mensagem) => {
    nivelBoia = mensagem;
    console.log(`Mensagem recebida no ${TOPICO_NIVEL_BOIA}: ${nivelBoia}`);
});

router.get('/nivel', async (req, res) => {
    try {
        console.log(`nivel boia: ${nivelBoia}`);
        return res.status(200).json({
            nivelBoia
        });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao obter dados' });
    }
});

export default router