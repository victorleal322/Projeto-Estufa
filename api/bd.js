import { Pool } from "pg";
import "dotenv/config";

const BD = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

const testarConexao = async () => {
    try {
        const cliente = await BD.connect();

        console.log("✅ Conexão com PostgreSQL estabelecida!");

        cliente.release();
    } catch (error) {
        console.error(
            "❌ Erro ao conectar com PostgreSQL:",
            error.message
        );
    }
};

testarConexao();

export { BD, testarConexao };