// Album Cover Generator — 8-language i18n.
// Locales: en, zh, es, pt, ru, ja, ko, fr
// Fallback chain: detected locale → en. No external lib.

export type Locale = 'en' | 'zh' | 'es' | 'pt' | 'ru' | 'ja' | 'ko' | 'fr';
const SUPPORTED: Locale[] = ['en', 'zh', 'es', 'pt', 'ru', 'ja', 'ko', 'fr'];

function detectLocale(): Locale {
  if (typeof localStorage !== 'undefined') {
    const override = localStorage.getItem('game_locale');
    if (override && SUPPORTED.includes(override as Locale)) return override as Locale;
  }
  const lang = (navigator.language || 'en').toLowerCase();
  if (lang.startsWith('zh')) return 'zh';
  if (lang.startsWith('es')) return 'es';
  if (lang.startsWith('pt')) return 'pt';
  if (lang.startsWith('ru')) return 'ru';
  if (lang.startsWith('ja')) return 'ja';
  if (lang.startsWith('ko')) return 'ko';
  if (lang.startsWith('fr')) return 'fr';
  return 'en';
}

type Dict = Record<string, string>;

const en: Dict = {
  ticket_label_in: 'pressing ticket',
  ticket_label_done: 'release ticket',
  ticket_label_pressing: 'pressing…',
  ticket_label_wall: 'archive',
  wall_link: 'archive',
  new_press_link: 'new press',
  brand: 'ALTERU RECORDS',
  brand_mark: 'ALT24',

  // Input phase
  input_heading: 'press a record',
  input_deck: 'three tracks, side a only. cut once.',
  input_w1: 'your first track',
  input_w2: 'your second track',
  input_w3: 'your third track',
  input_press: 'press record',
  input_fineprint: 'master cut at alteru records, brooklyn. order is permanent — keep the ticket.',

  // Loading phase
  loading_status: 'pressing',
  loading_sub: 'cutting your one and only.',
  loading_fineprint: 'do not remove ticket until cycle ends. ≈ 60 seconds.',
  step_master: 'cut master',
  step_lacquer: 'coat lacquer',
  step_wax: 'press wax',
  step_sleeve: 'ink sleeve',
  step_ship: 'ship out',

  // Result phase
  result_artist: 'artist',
  result_title: 'title',
  result_genre: 'genre',
  result_runtime: 'runtime',
  result_qty: '250 copies',
  result_new: 'press another',
  result_wall: 'archive',
  result_share: 'share',

  // Wall phase
  wall_heading: 'recent pressings',
  wall_sub: 'the last six lps to ship from the plant.',
  wall_empty: 'no records have shipped. press the first.',
  wall_back: 'back',
  on_file: 'on file',

  // Cover panel
  cover_chip_awaiting: 'pressing ticket',
  cover_chip_pressing: 'pressing now',
  cover_caption_awaiting: 'awaiting artwork',
  cover_caption_preview: 'preview · ready to press',
  cover_caption_pressing: 'cutting the master',

  // Misc / form chrome
  err_words: 'fill all three',
  hint_tap_play: 'fill three tracks',
  order_placed: 'order placed',
  pressed_on: 'pressed',
  form_no: 'form 24-a',
  qc_inspected: 'qc inspected',
  vinyl_finish: 'pressing',
  music_play: 'play',
  music_pause: 'pause',
  view_list: 'list',
  view_grid: 'grid',
  scope_my: 'mine',
  scope_all: 'all',
  ticket_label_play: 'now playing',
  footer_hero_play: 'on rotation',
  result_back_to_wall: 'back to archive',
  like: 'like',
  liked: 'liked',

  // Perforation labels
  perf_a_side: '— side a —',
  perf_process: '— process —',
  perf_credits: '— credits —',
  perf_tear: '— tear here ✂ —',
  perf_archive: '— catalog —',

  // Footer heroes
  footer_hero_in: 'order a pressing',
  footer_hero_pressing: 'pressing now',
  footer_hero_done: 'limited pressing',
  footer_hero_wall: 'crate digging',

  // Wizard (track-by-track input)
  wizard_next: 'next track',
};

const zh: Dict = {
  ticket_label_in: '压片工单',
  ticket_label_done: '发行票',
  ticket_label_pressing: '压片中…',
  ticket_label_wall: '档案',
  wall_link: '唱片墙',
  new_press_link: '新压一张',
  brand: 'ALTERU RECORDS',
  brand_mark: 'ALT24',

  input_heading: '压一张唱片',
  input_deck: '三首 A 面 · 只切一次 · B 面留白',
  input_w1: '你的第一曲',
  input_w2: '你的第二曲',
  input_w3: '你的第三曲',
  input_press: '压成黑胶',
  input_fineprint: '布鲁克林 ALTERU 母带切刻 · 订单不可撤 · 请保留工单',

  loading_status: '压片中',
  loading_sub: '为你切下独此一张',
  loading_fineprint: '请勿撕除工单 · 约一分钟',
  step_master: '切母带',
  step_lacquer: '涂漆膜',
  step_wax: '压蜡盘',
  step_sleeve: '印封套',
  step_ship: '出厂',

  result_artist: '艺人',
  result_title: '专辑',
  result_genre: '风格',
  result_runtime: '总长',
  result_qty: '限量 250 张',
  result_new: '再压一张',
  result_wall: '看档案',
  result_share: '分享',

  wall_heading: '近期出片',
  wall_sub: '近期出厂的六张 LP',
  wall_empty: '还没有人下单 · 由你开始',
  wall_back: '返回',
  on_file: '在档',

  cover_chip_awaiting: '压片工单',
  cover_chip_pressing: '压片中',
  cover_caption_awaiting: '封面待出',
  cover_caption_preview: '预览 · 可压片',
  cover_caption_pressing: '正在切母带',

  err_words: '请填满三首',
  hint_tap_play: '填三首再压',
  order_placed: '下单',
  pressed_on: '出片',
  form_no: '表单 24-A',
  qc_inspected: '质检合格',
  vinyl_finish: '本张压片',
  music_play: '播放',
  music_pause: '暂停',
  view_list: '列表',
  view_grid: '网格',
  scope_my: '我的',
  scope_all: '全部',
  ticket_label_play: '正在播放',
  footer_hero_play: '正在转动',
  result_back_to_wall: '返回档案',
  like: '点赞',
  liked: '已赞',

  perf_a_side: '— A 面 —',
  perf_process: '— 工序 —',
  perf_credits: '— 信息 —',
  perf_tear: '— 沿虚线撕开 ✂ —',
  perf_archive: '— 目录 —',

  footer_hero_in: '下单压片',
  footer_hero_pressing: '压片进行中',
  footer_hero_done: '限量压片',
  footer_hero_wall: '翻箱',

  wizard_next: '下一曲',
};

const es: Dict = {
  ticket_label_in: 'orden de prensa',
  ticket_label_done: 'ticket de lanzamiento',
  ticket_label_pressing: 'prensando…',
  ticket_label_wall: 'archivo',
  wall_link: 'archivo',
  new_press_link: 'nuevo',
  brand: 'ALTERU RECORDS',
  brand_mark: 'ALT24',

  input_heading: 'prensa un disco',
  input_deck: 'tres pistas, sólo lado a. corte único.',
  input_w1: 'tu primera pista',
  input_w2: 'tu segunda pista',
  input_w3: 'tu tercera pista',
  input_press: 'prensar disco',
  input_fineprint: 'master cortado en alteru records, brooklyn. orden irrevocable — guarda el ticket.',

  loading_status: 'prensando',
  loading_sub: 'cortando tu única copia.',
  loading_fineprint: 'no retires el ticket hasta el final. ≈ 60 segundos.',
  step_master: 'cortar master',
  step_lacquer: 'aplicar laca',
  step_wax: 'prensar cera',
  step_sleeve: 'imprimir funda',
  step_ship: 'envío',

  result_artist: 'artista',
  result_title: 'título',
  result_genre: 'género',
  result_runtime: 'duración',
  result_qty: '250 copias',
  result_new: 'otro disco',
  result_wall: 'archivo',
  result_share: 'compartir',

  wall_heading: 'prensas recientes',
  wall_sub: 'los últimos seis lps en salir de la planta.',
  wall_empty: 'ningún disco salió aún. prensa el primero.',
  wall_back: 'volver',
  on_file: 'en archivo',

  cover_chip_awaiting: 'orden de prensa',
  cover_chip_pressing: 'prensando',
  cover_caption_awaiting: 'a la espera de la portada',
  cover_caption_preview: 'previsualización · listo',
  cover_caption_pressing: 'cortando el master',

  err_words: 'rellena las tres',
  hint_tap_play: 'rellena tres pistas',
  order_placed: 'pedido',
  pressed_on: 'prensado',
  form_no: 'formulario 24-a',
  qc_inspected: 'qc aprobado',
  vinyl_finish: 'prensaje',
  music_play: 'reproducir',
  music_pause: 'pausa',
  view_list: 'lista',
  view_grid: 'cuadrícula',
  scope_my: 'mías',
  scope_all: 'todas',
  ticket_label_play: 'sonando',
  footer_hero_play: 'en rotación',
  result_back_to_wall: 'volver al archivo',
  like: 'me gusta',
  liked: 'gustó',

  perf_a_side: '— lado a —',
  perf_process: '— proceso —',
  perf_credits: '— créditos —',
  perf_tear: '— rasgar aquí ✂ —',
  perf_archive: '— catálogo —',

  footer_hero_in: 'encarga una prensa',
  footer_hero_pressing: 'prensando ahora',
  footer_hero_done: 'prensa limitada',
  footer_hero_wall: 'cavar cajas',

  wizard_next: 'siguiente pista',
};

const pt: Dict = {
  ticket_label_in: 'pedido de prensagem',
  ticket_label_done: 'ticket de lançamento',
  ticket_label_pressing: 'prensando…',
  ticket_label_wall: 'arquivo',
  wall_link: 'arquivo',
  new_press_link: 'novo',
  brand: 'ALTERU RECORDS',
  brand_mark: 'ALT24',

  input_heading: 'prensar um disco',
  input_deck: 'três faixas, só lado a. corte único.',
  input_w1: 'sua primeira faixa',
  input_w2: 'sua segunda faixa',
  input_w3: 'sua terceira faixa',
  input_press: 'prensar disco',
  input_fineprint: 'master cortado na alteru records, brooklyn. pedido permanente — guarde o ticket.',

  loading_status: 'prensando',
  loading_sub: 'cortando sua única cópia.',
  loading_fineprint: 'não retire o ticket até o fim. ≈ 60 segundos.',
  step_master: 'cortar master',
  step_lacquer: 'aplicar laca',
  step_wax: 'prensar cera',
  step_sleeve: 'imprimir capa',
  step_ship: 'envio',

  result_artist: 'artista',
  result_title: 'título',
  result_genre: 'gênero',
  result_runtime: 'duração',
  result_qty: '250 cópias',
  result_new: 'outro disco',
  result_wall: 'arquivo',
  result_share: 'compartilhar',

  wall_heading: 'prensagens recentes',
  wall_sub: 'os últimos seis lps a sair da fábrica.',
  wall_empty: 'nenhum disco saiu ainda. prensa o primeiro.',
  wall_back: 'voltar',
  on_file: 'no arquivo',

  cover_chip_awaiting: 'pedido de prensa',
  cover_chip_pressing: 'prensando',
  cover_caption_awaiting: 'aguardando a capa',
  cover_caption_preview: 'prévia · pronto',
  cover_caption_pressing: 'cortando o master',

  err_words: 'preencha as três',
  hint_tap_play: 'preencha três faixas',
  order_placed: 'pedido',
  pressed_on: 'prensado',
  form_no: 'formulário 24-a',
  qc_inspected: 'qc aprovado',
  vinyl_finish: 'prensagem',
  music_play: 'tocar',
  music_pause: 'pausar',
  view_list: 'lista',
  view_grid: 'grade',
  scope_my: 'minhas',
  scope_all: 'todas',
  ticket_label_play: 'tocando agora',
  footer_hero_play: 'em rotação',
  result_back_to_wall: 'voltar ao arquivo',
  like: 'curtir',
  liked: 'curtido',

  perf_a_side: '— lado a —',
  perf_process: '— processo —',
  perf_credits: '— créditos —',
  perf_tear: '— rasgue aqui ✂ —',
  perf_archive: '— catálogo —',

  footer_hero_in: 'encomenda uma prensa',
  footer_hero_pressing: 'prensando agora',
  footer_hero_done: 'prensa limitada',
  footer_hero_wall: 'caçar discos',

  wizard_next: 'próxima faixa',
};

const ru: Dict = {
  ticket_label_in: 'заказ на пресс',
  ticket_label_done: 'релизный билет',
  ticket_label_pressing: 'пресс…',
  ticket_label_wall: 'архив',
  wall_link: 'архив',
  new_press_link: 'новый',
  brand: 'ALTERU RECORDS',
  brand_mark: 'ALT24',

  input_heading: 'записать пластинку',
  input_deck: 'три трека, только сторона a. один пресс.',
  input_w1: 'твой первый трек',
  input_w2: 'твой второй трек',
  input_w3: 'твой третий трек',
  input_press: 'запрессовать',
  input_fineprint: 'мастер режется на alteru records, бруклин. заказ необратим — сохрани билет.',

  loading_status: 'пресс',
  loading_sub: 'режем единственный экземпляр.',
  loading_fineprint: 'не отрывайте билет до конца. ≈ 60 секунд.',
  step_master: 'резать мастер',
  step_lacquer: 'покрыть лак',
  step_wax: 'пресс воска',
  step_sleeve: 'печать конверта',
  step_ship: 'отгрузка',

  result_artist: 'артист',
  result_title: 'альбом',
  result_genre: 'жанр',
  result_runtime: 'длительность',
  result_qty: '250 копий',
  result_new: 'ещё один',
  result_wall: 'архив',
  result_share: 'поделиться',

  wall_heading: 'недавние прессы',
  wall_sub: 'последние шесть lp с завода.',
  wall_empty: 'пока ничего не выпущено. начни ты.',
  wall_back: 'назад',
  on_file: 'в архиве',

  cover_chip_awaiting: 'заказ на пресс',
  cover_chip_pressing: 'пресс',
  cover_caption_awaiting: 'обложка ожидается',
  cover_caption_preview: 'предпросмотр · готов',
  cover_caption_pressing: 'режется мастер',

  err_words: 'заполни все три',
  hint_tap_play: 'впиши три трека',
  order_placed: 'заказ',
  pressed_on: 'пресс',
  form_no: 'форма 24-a',
  qc_inspected: 'qc прошёл',
  vinyl_finish: 'пресс',
  music_play: 'играть',
  music_pause: 'пауза',
  view_list: 'список',
  view_grid: 'сетка',
  scope_my: 'мои',
  scope_all: 'все',
  ticket_label_play: 'сейчас играет',
  footer_hero_play: 'в ротации',
  result_back_to_wall: 'назад в архив',
  like: 'лайк',
  liked: 'нравится',

  perf_a_side: '— сторона a —',
  perf_process: '— процесс —',
  perf_credits: '— титры —',
  perf_tear: '— оторвите здесь ✂ —',
  perf_archive: '— каталог —',

  footer_hero_in: 'заказать пресс',
  footer_hero_pressing: 'идёт пресс',
  footer_hero_done: 'лимитированный пресс',
  footer_hero_wall: 'рыться в крейте',

  wizard_next: 'следующий трек',
};

const ja: Dict = {
  ticket_label_in: 'プレス工程票',
  ticket_label_done: 'リリース票',
  ticket_label_pressing: 'プレス中…',
  ticket_label_wall: 'アーカイブ',
  wall_link: 'アーカイブ',
  new_press_link: '新規',
  brand: 'ALTERU RECORDS',
  brand_mark: 'ALT24',

  input_heading: 'レコードを切る',
  input_deck: '3 曲、A 面のみ。一度きりカット。',
  input_w1: '1 曲目のタイトル',
  input_w2: '2 曲目のタイトル',
  input_w3: '3 曲目のタイトル',
  input_press: 'プレスする',
  input_fineprint: 'ブルックリンの alteru records にてマスターを切削。注文は取消不可、券は保管を。',

  loading_status: 'プレス中',
  loading_sub: '唯一の一枚を切っています',
  loading_fineprint: '完了まで券を外さないで。約 60 秒。',
  step_master: 'マスター切削',
  step_lacquer: 'ラッカー塗布',
  step_wax: 'ワックスプレス',
  step_sleeve: 'スリーブ印刷',
  step_ship: '出荷',

  result_artist: 'アーティスト',
  result_title: 'タイトル',
  result_genre: 'ジャンル',
  result_runtime: '総時間',
  result_qty: '限定 250 枚',
  result_new: 'もう一枚',
  result_wall: 'アーカイブ',
  result_share: 'シェア',

  wall_heading: '最近のプレス',
  wall_sub: '工場から出荷された直近 6 枚の LP',
  wall_empty: 'まだ一枚も出ていない。最初の一枚を。',
  wall_back: '戻る',
  on_file: '登録',

  cover_chip_awaiting: 'プレス工程票',
  cover_chip_pressing: 'プレス中',
  cover_caption_awaiting: 'アートワーク待ち',
  cover_caption_preview: 'プレビュー · プレス可能',
  cover_caption_pressing: 'マスター切削中',

  err_words: '3 つ全部入れて',
  hint_tap_play: '3 曲入れて',
  order_placed: '受注',
  pressed_on: 'プレス',
  form_no: '様式 24-A',
  qc_inspected: '検品済',
  vinyl_finish: 'プレス',
  music_play: '再生',
  music_pause: '一時停止',
  view_list: 'リスト',
  view_grid: 'グリッド',
  scope_my: '自分',
  scope_all: 'みんな',
  ticket_label_play: '再生中',
  footer_hero_play: 'オン ローテーション',
  result_back_to_wall: 'アーカイブへ',
  like: 'いいね',
  liked: 'いいね済',

  perf_a_side: '— A 面 —',
  perf_process: '— 工程 —',
  perf_credits: '— クレジット —',
  perf_tear: '— ここで切る ✂ —',
  perf_archive: '— カタログ —',

  footer_hero_in: 'プレスを依頼',
  footer_hero_pressing: 'プレス中',
  footer_hero_done: '限定プレス',
  footer_hero_wall: 'クレート漁り',

  wizard_next: '次の曲',
};

const ko: Dict = {
  ticket_label_in: '프레스 작업표',
  ticket_label_done: '발매 티켓',
  ticket_label_pressing: '프레싱…',
  ticket_label_wall: '아카이브',
  wall_link: '아카이브',
  new_press_link: '신규',
  brand: 'ALTERU RECORDS',
  brand_mark: 'ALT24',

  input_heading: '레코드 만들기',
  input_deck: '세 곡, A 면만. 단 한 번 커팅.',
  input_w1: '첫 번째 곡 제목',
  input_w2: '두 번째 곡 제목',
  input_w3: '세 번째 곡 제목',
  input_press: '프레스 하기',
  input_fineprint: '브루클린 alteru records 에서 마스터 커팅. 주문 취소 불가, 티켓 보관 요망.',

  loading_status: '프레스 중',
  loading_sub: '단 한 장의 커팅 중입니다',
  loading_fineprint: '완료까지 티켓을 떼지 마세요. 약 60 초.',
  step_master: '마스터 커팅',
  step_lacquer: '래커 코팅',
  step_wax: '왁스 프레스',
  step_sleeve: '슬리브 인쇄',
  step_ship: '출고',

  result_artist: '아티스트',
  result_title: '타이틀',
  result_genre: '장르',
  result_runtime: '총 길이',
  result_qty: '한정 250 장',
  result_new: '한 장 더',
  result_wall: '아카이브',
  result_share: '공유',

  wall_heading: '최근 프레스',
  wall_sub: '공장에서 최근 출고된 6 장의 LP',
  wall_empty: '아직 출고된 게 없어. 첫 장을 찍어봐.',
  wall_back: '뒤로',
  on_file: '등록',

  cover_chip_awaiting: '프레스 작업표',
  cover_chip_pressing: '프레스 중',
  cover_caption_awaiting: '아트워크 대기',
  cover_caption_preview: '미리보기 · 프레스 가능',
  cover_caption_pressing: '마스터 커팅 중',

  err_words: '세 칸 모두 채워줘',
  hint_tap_play: '세 곡을 채워줘',
  order_placed: '주문',
  pressed_on: '프레스',
  form_no: '양식 24-A',
  qc_inspected: '검사 통과',
  vinyl_finish: '프레스',
  music_play: '재생',
  music_pause: '일시정지',
  view_list: '리스트',
  view_grid: '그리드',
  scope_my: '내 것',
  scope_all: '전체',
  ticket_label_play: '재생 중',
  footer_hero_play: '회전 중',
  result_back_to_wall: '아카이브로',
  like: '좋아요',
  liked: '좋아요 함',

  perf_a_side: '— A 면 —',
  perf_process: '— 공정 —',
  perf_credits: '— 크레딧 —',
  perf_tear: '— 여기를 자르세요 ✂ —',
  perf_archive: '— 카탈로그 —',

  footer_hero_in: '프레스 주문',
  footer_hero_pressing: '프레스 중',
  footer_hero_done: '한정 프레스',
  footer_hero_wall: '크레이트 디깅',

  wizard_next: '다음 곡',
};

const fr: Dict = {
  ticket_label_in: 'bon de pressage',
  ticket_label_done: 'ticket de sortie',
  ticket_label_pressing: 'pressage…',
  ticket_label_wall: 'archives',
  wall_link: 'archives',
  new_press_link: 'nouveau',
  brand: 'ALTERU RECORDS',
  brand_mark: 'ALT24',

  input_heading: 'presser un disque',
  input_deck: 'trois titres, face a uniquement. coupe unique.',
  input_w1: 'ta première piste',
  input_w2: 'ta deuxième piste',
  input_w3: 'ta troisième piste',
  input_press: 'presser',
  input_fineprint: 'master gravé chez alteru records, brooklyn. commande irrévocable — gardez le ticket.',

  loading_status: 'pressage',
  loading_sub: 'on grave votre exemplaire unique.',
  loading_fineprint: "ne retirez pas le ticket avant la fin. ≈ 60 secondes.",
  step_master: 'graver le master',
  step_lacquer: 'enduire le laque',
  step_wax: 'presser la cire',
  step_sleeve: 'imprimer la pochette',
  step_ship: 'expédier',

  result_artist: 'artiste',
  result_title: 'titre',
  result_genre: 'genre',
  result_runtime: 'durée',
  result_qty: '250 copies',
  result_new: 'encore un',
  result_wall: 'archives',
  result_share: 'partager',

  wall_heading: 'pressages récents',
  wall_sub: 'les six derniers lps sortis de l’usine.',
  wall_empty: 'aucun disque sorti. presse le premier.',
  wall_back: 'retour',
  on_file: 'archivés',

  cover_chip_awaiting: 'bon de pressage',
  cover_chip_pressing: 'pressage',
  cover_caption_awaiting: 'pochette en attente',
  cover_caption_preview: 'aperçu · prêt à presser',
  cover_caption_pressing: 'gravure du master',

  err_words: 'remplis les trois',
  hint_tap_play: 'remplis trois titres',
  order_placed: 'commande',
  pressed_on: 'pressé',
  form_no: 'formulaire 24-a',
  qc_inspected: 'qc validé',
  vinyl_finish: 'pressage',
  music_play: 'lecture',
  music_pause: 'pause',
  view_list: 'liste',
  view_grid: 'grille',
  scope_my: 'mes',
  scope_all: 'tout',
  ticket_label_play: 'en lecture',
  footer_hero_play: 'en rotation',
  result_back_to_wall: 'retour aux archives',
  like: 'aimer',
  liked: 'aimé',

  perf_a_side: '— face a —',
  perf_process: '— processus —',
  perf_credits: '— crédits —',
  perf_tear: '— déchirer ici ✂ —',
  perf_archive: '— catalogue —',

  footer_hero_in: 'commander un pressage',
  footer_hero_pressing: 'pressage en cours',
  footer_hero_done: 'pressage limité',
  footer_hero_wall: 'fouille de bacs',

  wizard_next: 'piste suivante',
};

const DICTS: Record<Locale, Dict> = { en, zh, es, pt, ru, ja, ko, fr };

const _locale: Locale = detectLocale();
const _dict: Dict = DICTS[_locale];
const _fallback: Dict = en;

export function t(key: string): string {
  return _dict[key] ?? _fallback[key] ?? key;
}

export function locale(): Locale {
  return _locale;
}
