"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Book, Calendar } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Dados das leituras
const LEITURAS = [
  {
    data: "12/05/2025",
    titulo: "Domingo da Ascensão do Senhor",
    leituras: [
      {
        nome: "Primeira Leitura",
        referencia: "Atos 1,1-11",
        texto:
          "No meu primeiro livro, ó Teófilo, narrei todas as coisas que Jesus começou a fazer e ensinar, até o dia em que foi levado para o céu, depois de ter dado instruções pelo Espírito Santo, aos apóstolos que tinha escolhido. Foi a estes que Jesus se mostrou vivo depois da sua paixão, com numerosas provas. Durante quarenta dias, apareceu-lhes falando do Reino de Deus. Durante uma refeição, deu-lhes esta ordem: 'Não vos afasteis de Jerusalém, mas esperai a realização da promessa do Pai, da qual vós me ouvistes falar: 'João batizou com água; vós, porém, sereis batizados com o Espírito Santo, dentro de poucos dias''. Então os que estavam reunidos perguntaram a Jesus: 'Senhor, é agora que vais restaurar o Reino em Israel?' Jesus respondeu: 'Não vos cabe saber os tempos e os momentos que o Pai determinou com a sua própria autoridade. Mas recebereis o poder do Espírito Santo que descerá sobre vós, para serdes minhas testemunhas em Jerusalém, em toda a Judéia e na Samaria, e até os confins da terra'. Depois de dizer isto, Jesus foi levado ao céu, à vista deles. Uma nuvem o encobriu, de forma que seus olhos não podiam mais vê-lo. Os apóstolos continuavam olhando para o céu, enquanto Jesus subia. Apareceram então dois homens vestidos de branco, que lhes disseram: 'Homens da Galileia, por que ficais aqui, parados, olhando para o céu? Esse Jesus que vos foi levado para o céu, virá do mesmo modo como o vistes partir para o céu'.",
      },
      {
        nome: "Salmo",
        referencia: "Salmo 46",
        texto:
          "Povos todos do universo, batei palmas, gritai a Deus aclamações de alegria! Porque sublime é o Senhor, o Altíssimo, o soberano que domina toda a terra. Por entre aclamações Deus se elevou, o Senhor subiu ao toque da trombeta. Salmodiai ao nosso Deus ao som da harpa, salmodiai ao som da harpa ao nosso Rei! Porque Deus é o grande Rei de toda a terra, ao som da harpa acompanhai os seus louvores! Deus reina sobre todas as nações, está sentado no seu trono glorioso.",
      },
      {
        nome: "Segunda Leitura",
        referencia: "Efésios 1,17-23",
        texto:
          "Irmãos: O Deus de nosso Senhor Jesus Cristo, o Pai a quem pertence a glória, vos dê um espírito de sabedoria que vo-lo revele e faça verdadeiramente conhecer. Que ele abra o vosso coração à sua luz, para que saibais qual a esperança que o seu chamamento vos dá, qual a riqueza da glória que está na vossa herança com os santos, e que imenso poder ele exerceu em favor de nós que cremos, de acordo com a sua ação e força onipotente. Ele manifestou sua força em Cristo, quando o ressuscitou dos mortos e o fez sentar-se à sua direita nos céus, bem acima de toda a autoridade, poder, potência, soberania ou qualquer título que se possa mencionar não somente neste mundo, mas ainda no mundo futuro. Sim, ele pôs tudo sob os seus pés e fez dele, que está acima de tudo, a Cabeça da Igreja, que é o seu corpo, a plenitude daquele que possui a plenitude universal.",
      },
      {
        nome: "Evangelho",
        referencia: "Marcos 16,15-20",
        texto:
          "Naquele tempo, Jesus apareceu aos onze discípulos e disse-lhes: 'Ide pelo mundo inteiro e anunciai o Evangelho a toda criatura! Quem crer e for batizado será salvo. Quem não crer será condenado. Os sinais que acompanharão aqueles que crerem serão estes: expulsarão demônios em meu nome, falarão novas línguas; se pegarem em serpentes ou beberem algum veneno mortal não lhes fará mal algum; quando impuserem as mãos sobre os doentes, eles ficarão curados'. Depois de falar com os discípulos, o Senhor Jesus foi levado ao céu, e sentou-se à direita de Deus. Os discípulos então saíram e pregaram por toda parte. O Senhor os ajudava e confirmava sua palavra por meio dos sinais que a acompanhavam.",
      },
    ],
  },
  {
    data: "19/05/2025",
    titulo: "Domingo de Pentecostes",
    leituras: [
      {
        nome: "Primeira Leitura",
        referencia: "Atos 2,1-11",
        texto:
          "Quando chegou o dia de Pentecostes, os discípulos estavam todos reunidos no mesmo lugar. De repente, veio do céu um ruído como de um vento forte, que encheu toda a casa em que se encontravam. Então apareceram línguas como de fogo que se repartiram e pousaram sobre cada um deles. Todos ficaram cheios do Espírito Santo e começaram a falar em outras línguas, conforme o Espírito lhes concedia expressar-se. Residiam em Jerusalém judeus devotos, de todas as nações do mundo. Quando ouviram o ruído, reuniu-se a multidão, e todos ficaram confusos, pois cada um ouvia os discípulos falar em sua própria língua. Cheios de espanto e admiração, diziam: 'Esses homens que estão falando não são todos galileus? Como é que nós os escutamos na nossa própria língua? Nós que somos partos, medos e elamitas, habitantes da Mesopotâmia, da Judéia e da Capadócia, do Ponto e da Ásia, da Frígia e da Panfília, do Egito e da parte da Líbia próxima de Cirene, também romanos que aqui residem; judeus e prosélitos, cretenses e árabes, todos nós os escutamos anunciarem as maravilhas de Deus na nossa própria língua!'",
      },
      {
        nome: "Salmo",
        referencia: "Salmo 103",
        texto:
          "Bendize, ó minha alma, ao Senhor! Ó meu Deus e meu Senhor, como sois grande! Quão numerosas, ó Senhor, são vossas obras! Encheu-se a terra com as vossas criaturas! Se tirais o seu respiro, elas perecem e voltam para o pó de onde vieram. Enviais o vosso espírito e renascem e da terra toda a face renovais. Que a glória do Senhor perdure sempre, e alegre-se o Senhor em suas obras! Hoje seja-lhe agradável o meu canto, pois o Senhor é a minha grande alegria!",
      },
      {
        nome: "Segunda Leitura",
        referencia: "1 Coríntios 12,3b-7.12-13",
        texto:
          "Irmãos: Ninguém pode dizer: Jesus é o Senhor, a não ser no Espírito Santo. Há diversidade de dons, mas um mesmo é o Espírito. Há diversidade de ministérios, mas um mesmo é o Senhor. Há diferentes atividades, mas um mesmo Deus que realiza todas as coisas em todos. A cada um é dada a manifestação do Espírito em vista do bem comum. Como o corpo é um, embora tenha muitos membros, e como todos os membros do corpo, embora sejam muitos, formam um só corpo, assim também acontece com Cristo. De fato, todos nós, judeus ou gregos, escravos ou livres, fomos batizados num único Espírito, para formarmos um único corpo, e todos nós bebemos de um único Espírito.",
      },
      {
        nome: "Evangelho",
        referencia: "João 20,19-23",
        texto:
          "Ao anoitecer daquele dia, o primeiro da semana, estando fechadas, por medo dos judeus, as portas do lugar onde os discípulos se encontravam, Jesus entrou e, pondo-se no meio deles, disse: 'A paz esteja convosco'. Depois dessas palavras, mostrou-lhes as mãos e o lado. Então os discípulos se alegraram por verem o Senhor. Novamente, Jesus disse: 'A paz esteja convosco. Como o Pai me enviou, também eu vos envio'. E depois de ter dito isso, soprou sobre eles e disse: 'Recebei o Espírito Santo. A quem perdoardes os pecados, eles lhes serão perdoados; a quem os não perdoardes, eles lhes serão retidos'.",
      },
    ],
  },
  {
    data: "26/05/2025",
    titulo: "Santíssima Trindade",
    leituras: [
      {
        nome: "Primeira Leitura",
        referencia: "Deuteronômio 4,32-34.39-40",
        texto:
          "Moisés falou ao povo dizendo: 'Interroga os tempos antigos que te precederam, desde o dia em que Deus criou o homem sobre a terra, e investiga de um extremo ao outro do céu, se houve jamais um acontecimento tão grande, ou se ouviu algo semelhante. Existe porventura algum povo que tenha ouvido a voz de Deus falando-lhe do meio do fogo, como tu ouviste, e tenha permanecido vivo? Ou terá jamais algum Deus vindo escolher para si um povo entre as nações, por meio de provações, de sinais e prodígios, por meio de combates, com mão forte e braço estendido, e por meio de grandes terrores, como tudo o que por ti o Senhor vosso Deus fez no Egito, diante de teus próprios olhos? Reconhece, pois, hoje, e grava-o em teu coração, que o Senhor é o Deus lá em cima no céu e cá embaixo na terra, e que não há outro além dele. Guarda suas leis e seus mandamentos que hoje te prescrevo, para que sejas feliz, tu e teus filhos depois de ti, e vivas longos dias sobre a terra que o Senhor teu Deus te dá para sempre'.",
      },
      {
        nome: "Salmo",
        referencia: "Salmo 32",
        texto:
          "Reta é a palavra do Senhor, e tudo o que ele faz merece fé. Deus ama o direito e a justiça, transborda em toda a terra a sua graça. A palavra do Senhor criou os céus, e o sopro de seus lábios, as estrelas. Ele falou e toda a terra foi criada, ele ordenou e as coisas todas existiram. Mas o Senhor pousa o olhar sobre os que o temem, e que confiam esperando em seu amor, para da morte libertar as suas vidas e alimentá-los quando é tempo de penúria. No Senhor nós esperamos confiantes, porque ele é nosso auxílio e proteção!",
      },
      {
        nome: "Segunda Leitura",
        referencia: "Romanos 8,14-17",
        texto:
          "Irmãos: Todos aqueles que se deixam conduzir pelo Espírito de Deus são filhos de Deus. De fato, vós não recebestes um espírito de escravos, para recairdes no temor, mas recebestes um espírito de filhos adotivos, no qual todos nós clamamos: Abbá - ó Pai! O próprio Espírito se une ao nosso espírito para nos atestar que somos filhos de Deus. E, se somos filhos, somos também herdeiros; herdeiros de Deus e co-herdeiros de Cristo; se realmente sofremos com ele, para sermos também glorificados com ele.",
      },
      {
        nome: "Evangelho",
        referencia: "Mateus 28,16-20",
        texto:
          "Naquele tempo, os onze discípulos foram para a Galileia, ao monte que Jesus lhes tinha indicado. Quando o viram, prostraram-se diante dele. Ainda assim alguns duvidaram. Então Jesus aproximou-se e falou: 'Toda a autoridade me foi dada no céu e sobre a terra. Portanto, ide e fazei discípulos meus todos os povos, batizando-os em nome do Pai e do Filho e do Espírito Santo, e ensinando-os a observar tudo o que vos ordenei! Eis que eu estarei convosco todos os dias, até o fim do mundo'.",
      },
    ],
  },
]

export default function LeiturasPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<string>(LEITURAS[0].data)

  // Encontrar a leitura para a data selecionada
  const leituraSelecionada = LEITURAS.find((leitura) => leitura.data === selectedDate) || LEITURAS[0]

  return (
    <div className="min-h-screen">
      <header className="church-header py-4 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="mr-2 text-white hover:bg-amber-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <div className="relative w-8 h-8 mr-3">
              <Image
                src="/images/logo.png"
                alt="Paróquia São Roque"
                width={32}
                height={32}
                className="relative z-10 rounded-full object-cover"
              />
            </div>
            <h1 className="text-xl font-semibold text-white font-cinzel">Leituras Bíblicas</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="church-card overflow-hidden mb-6">
          <CardHeader className="church-card-header bg-gradient-to-r from-amber-50 to-amber-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Book className="h-5 w-5 text-amber-700 mr-2" />
                <CardTitle className="text-amber-900 font-cinzel">Leituras do Dia</CardTitle>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-amber-700 mr-2" />
                <span className="text-sm text-amber-800">Selecione a data:</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-6">
              <Tabs defaultValue={LEITURAS[0].data} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  {LEITURAS.map((leitura) => (
                    <TabsTrigger
                      key={leitura.data}
                      value={leitura.data}
                      onClick={() => setSelectedDate(leitura.data)}
                      className="text-amber-800"
                    >
                      {leitura.data}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <h2 className="text-xl font-bold text-amber-900 font-cinzel text-center mb-2">
                {leituraSelecionada.titulo}
              </h2>
              <div className="church-divider w-32 mx-auto mb-6"></div>
            </div>

            {leituraSelecionada.leituras.map((leitura, index) => (
              <Card key={index} className="mb-6 border-amber-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-amber-800">{leitura.nome}</CardTitle>
                  <CardDescription className="text-amber-700">{leitura.referencia}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-900 leading-relaxed">{leitura.texto}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
