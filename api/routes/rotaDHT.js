import { Router } from "express";
import { onMessage, TOPICO_TEMPERATURA, TOPICO_UMIDADE_AR } from "../services/mqttClient.js";

const router = Router();
let temperatura = "Desconhecido";
let umidade = "Desconhecido";

onMessage(TOPICO_TEMPERATURA, (mensagem) => {
    temperatura = mensagem;
    console.log(`Mensagem recebida no ${TOPICO_TEMPERATURA}: ${temperatura}`);
});

onMessage(TOPICO_UMIDADE_AR, (mensagem) => {
    umidade = mensagem;
    console.log(`Mensagem recebida no ${TOPICO_UMIDADE_AR}: ${umidade}`);
});

router.get('/dados', async (req, res) => {
    try {
        return res.status(200).json({ temperatura, umidade });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao obter dados' });
    }
});

export default router;