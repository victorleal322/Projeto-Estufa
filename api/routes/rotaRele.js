import { Router } from "express";
import { onMessage, publicar, TOPICO_STATUS, TOPICO_ESTADO_LED } from "../services/mqttClient.js";

const router = Router();
import { BD } from '../bd.js';

let status = "Desconhecido";

onMessage(TOPICO_STATUS, async (mensagem) => {
    status = mensagem;
    console.log(`Mensagem recebida no ${TOPICO_STATUS}: ${status}`);
    try {
        await BD.query(
            "INSERT INTO estado_atuadores (nome_atuador, estado) VALUES ('Led/Relé', $1)",
            [mensagem]
        );
    } catch (error) {
        console.error('Erro ao salvar estado do Led/Relé no BD:', error.message);
    }
});

router.get('/status', async (req, res) => {
    try {
        return res.status(200).json({ status });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao obter dados' });
    }
});

router.post('/estadoLed', async (req, res) => {
    try {
        const { estado } = req.body;
       
        if (estado === undefined || (estado !== 0 && estado !== 1)) {
            return res.status(400).json({ error: 'Estado inválido. Use 0 ou 1.' });
        }
       
        await publicar(TOPICO_ESTADO_LED, estado.toString());
        return res.status(200).json({ message: 'Estado do LED alterado com sucesso', estado });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao publicar estado do LED' });
    }
});

export default router