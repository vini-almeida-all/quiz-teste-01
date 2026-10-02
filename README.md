# Quiz dos chalés — beta 0.3 revisada

Esta versão foi refeita com a identidade visual enviada em `identidade_visual_quiz_imagens.zip`. A abertura usa a paisagem noturna e o selo do acampamento; as perguntas e o desempate usam pergaminho; o resultado aplica a paleta do chalé e mostra seu banner ilustrado. Os 18 banners em `assets/banners/` foram reconstruídos em alta resolução com base nos painéis em `reference/`, preservados sem alteração. Os nomes e números dos chalés são texto vivo da interface.

## Abrir no navegador

1. Extraia o ZIP inteiro para uma pasta.
2. Dê dois cliques em `index.html`.

Não é necessário instalar Node.js, executar comandos, iniciar servidor ou ter conexão com a internet. Mantenha as pastas `assets/` e `reference/` ao lado do HTML.

## O que está incluído

- As 13 perguntas, a matriz de pontuação e os 18 resultados oficiais do pacote de dados anterior.
- Desempate por pontuação total, quantidade de `+3`, perguntas estruturais e pergunta final dinâmica quando necessário.
- Temas cromáticos dos 18 chalés, aplicados somente após a revelação, com cabeçalho centralizado no resultado.
- Moldura de pergaminho em nove partes para manter os ornamentos proporcionais quando a pergunta ou o resultado ocupa mais altura; ilustrações exibidas com recorte proporcional, sem esticar.
- Cabeçalhos e ação de refazer centralizados; parágrafos longos alinhados à esquerda para leitura confortável também no celular.
- Fontes locais e imagens incluídas no pacote. A paisagem de abertura e a base de pergaminho foram criadas para adaptar a composição das referências ao conteúdo real do quiz; o selo vem das imagens fornecidas e os banners são reconstruções detalhadas dessas referências.
- Código-fonte legível em JavaScript e CSS, com os dados originais também em `source-data/`.

Os arquivos PNG de `reference/` são referências visuais fornecidas para este projeto. As imagens geradas em `assets/` são componentes da interface desta versão.
