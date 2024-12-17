# npm-translate

Uma biblioteca Node.js para criar arquivos de tradução no padrão **i18n** para projetos Angular.  
Esta ferramenta permite gerar e gerenciar arquivos de tradução com base em configurações personalizadas.

---

## Como Funciona

A biblioteca automatiza o processo de geração e atualização de arquivos de tradução seguindo o padrão **i18n**. O funcionamento é simples:

1. O script percorre todas as pastas do seu projeto em busca de diretórios chamados **i18n**.
2. Dentro desses diretórios, procura especificamente pelo arquivo `pt.json`, que é considerado a base para traduções.
3. Caso o script encontre um arquivo `pt.json`, ele realiza as seguintes operações:
   - **Comparação**: Analisa o conteúdo de `pt.json` em relação aos arquivos de idiomas secundários (`es.json` e `en.json`).
   - **Atualização**: Adiciona automaticamente quaisquer propriedades faltantes nos arquivos de idiomas secundários, traduzindo os valores do português para os idiomas especificados.
   - **Criação**: Se os arquivos `es.json` e `en.json` não existirem, eles serão criados automaticamente com base no conteúdo de `pt.json`, já traduzidos para espanhol e inglês.

Este processo facilita a manutenção das traduções no projeto, garantindo que todos os idiomas estejam sincronizados e atualizados com o texto original.

## Instalação

Instale a biblioteca no seu projeto usando npm, o script ira percorrer todas as pastas do seu projeto procurando pastas com o nome i18n procurando pelo arquivo pt.json. Caso encontre o arquivo pt.json ira comparar com os aquivos es.json e en.json adicionando as propriedades faltantes jpa traduzindo o texto e caso não exista ira criar esses arquivos es.json e en.json

```bash
npm install npm-translate
```

## Configurações iniciais

Certifique-se de ter configurado o arquivo config.js com seu e-mail e chave da API do Google para garantir o funcionamento correto. Veja a seção de configuração inicial para mais detalhes.

```bash
{
  "email": "seuemail@google.com",
  "key": "Sua_chave_api_google_translate"
}
```

## Rodando o script

```bash
npx start-translation
```

## Notas de Atualização

### [1.1.0] - 2024-12-17

#### Adicionado

- Suporte para arquivos `pt-BR.json`, gerando arquivos para inglês como `en-US.json` e espanho `es-ES.json`.
- Suporte para projeger variaveis dos textos. Qualquer valor entre `{{}}` não serão traduzidos Ex: 'Bom dia {{ name }}, tudo bem?'
