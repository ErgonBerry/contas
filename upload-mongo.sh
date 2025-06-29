#!/bin/bash

# Verifica se a variável MONGO_URI está definida
if [ -z "$MONGO_URI" ]; then
    echo "Erro: A variável de ambiente MONGO_URI não está definida."
    exit 1
fi

# Configuração do banco e coleção
DATABASE="household_db"
COLLECTION="expenses"
FILE="expenses.json"

# Verifica se o arquivo CSV existe
if [ ! -f "$FILE" ]; then
    echo "Erro: Arquivo CSV não encontrado!"
    exit 1
fi

cat $FILE | sed 's/^\[//; s/\]$//; s/},/}/g' > contatos_formatados.json

# Executa mongoimport dentro de um contêiner Docker
docker run --rm -v "$(pwd):/data" mongo:latest mongoimport \
  --uri "$MONGO_URI" \
  --db "$DATABASE" \
  --collection "$COLLECTION" \
  --type json \
  --file /data/contatos_formatados.json
  
  rm contatos_formatados.json
  echo "✅ Importação concluída com sucesso!"
