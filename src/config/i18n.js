/**
 * Internationalization (i18n) Configuration for FDShowStudio Web
 * Supported Languages:
 *   - vi: Tiếng Việt (Default)
 *   - en: English
 *   - ja: 日本語
 *   - zh: 繁體中文
 */

export const translations = {
  vi: {
    // Nav & Common
    nav_community_title: 'Cộng đồng & Mạng xã hội',
    nav_sound_on: 'Bật âm thanh pháo hoa (hiện đang tắt)',
    nav_sound_off: 'Tắt âm thanh pháo hoa (hiện đang bật)',
    nav_lang_title: 'Chuyển ngôn ngữ / Switch Language',
    nav_download_title: 'Tải FDShowStudio (GitHub Releases)',

    // Side Nav Dots
    side_home: '01 Home',
    side_home_title: 'Khối 1: FDShowStudio',
    side_exp: '02 Trải nghiệm',
    side_exp_title: 'Khối 2: Khu trải nghiệm',
    side_community: '03 Tham gia',
    side_community_title: 'Khối 3: Tham gia & Cộng đồng',

    // Block 1: Intro
    intro_badge: 'Phần mềm thiết kế 3D',
    intro_bullet_1: 'Trình thiết kế, biên tập kịch bản pháo hoa',
    intro_bullet_2: 'Thiết kế hình dáng chuyển động cho đội hình drone',
    intro_desc: 'Mô phỏng 3D thời gian thực với vật lý pyrotechnic chuẩn xác, bắt beat nhạc tự động và tạo chuyển động quỹ đạo ánh sáng cho hàng ngàn drone biểu diễn.',
    btn_download_new: 'Tải phiên bản mới',
    btn_experience_now: 'Trải nghiệm ngay',
    video_label: 'Video intro',
    scroll_prompt: 'Cuộn chuột để trải nghiệm',

    // Block 2: Experience Arena
    sky_hint: 'Nhấp chuột bất kỳ lên bầu trời để bắn pháo hoa',
    btn_close_dock_title: 'Ẩn bảng chọn (Thu gọn)',
    scrubber_title: 'Nhấp hoặc kéo để tua thời gian show',
    tab_shows: 'Kịch bản show (5)',
    tab_big_shell: 'Big Shell (8)',
    tab_small_shell: 'Small Shell (26)',
    status_ready: 'Bầu trời 3D sẵn sàng',
    btn_import_audio: 'Nạp MP3 từ máy',
    btn_import_audio_title: 'Nạp tệp âm thanh MP3 từ thiết bị của bạn',
    btn_sound_on: 'Âm thanh: Bật',
    btn_sound_off: 'Âm thanh: Tắt',
    btn_toggle_sound_title: 'Bật hoặc tắt âm thanh pháo hoa',
    btn_fire_random: 'Bắn ngẫu nhiên',
    btn_fire_random_title: 'Bắn ngẫu nhiên pháo hoa',
    btn_stop_show: 'Dừng kịch bản',
    btn_stop_show_title: 'Dừng kịch bản hoặc show',
    btn_play_show: 'Phát show',
    btn_playing_show: 'Dừng',
    btn_dock_toggle: 'Kịch bản ∧',
    btn_dock_toggle_title: 'Mở lại bảng chọn kịch bản',

    // Show Subtitles
    secret_base_sub: 'Ballad cảm xúc • 5m49s',
    blood_tear_sub: 'Kịch tính dồn dập • 4m05s',
    hanabi_sub: 'Lễ hội rực rỡ sắc màu',
    lose_control_sub: 'Năng lượng điện tử bùng nổ',
    monody_sub: 'Giao hưởng pháo hoa hoành tráng',

    // Shell Chips
    shell_big_label: 'Pháo',
    shell_chip_title: 'Kích nổ',

    // Block 3: Community
    comm_tag: 'Cộng đồng & Tham gia',
    comm_title: 'Tham gia cùng FDShowStudio',
    step_1_badge: 'BƯỚC 1',
    step_1_heading: 'Download',
    step_1_bullet_1: 'Tải phiên bản mới tại trang phát hành chính thức',
    step_1_bullet_2: 'Khởi chạy ứng dụng trực tiếp trên máy tính',
    step_1_bullet_3: 'Trải nghiệm cơ bản các công cụ tạo kịch bản 3D',
    step_1_action: 'Tải cho Windows',
    bridge_1: 'Để học cách sử dụng',
    step_2_badge: 'BƯỚC 2',
    step_2_heading: 'Học cách sử dụng',
    step_2_bullet_1: 'Xem kênh youtube chính thức của FDShowStudio',
    step_2_bullet_2: 'Nắm vững thao tác biên tập timeline và bắt beat nhạc',
    step_2_bullet_3: 'Học mẹo tối ưu hóa hình dáng đội hình drone 3D',
    step_2_action: 'Kênh YouTube',
    bridge_2: 'Tham gia cộng đồng',
    step_3_badge: 'BƯỚC 3',
    step_3_heading: 'Tham gia cộng đồng',
    step_3_bullet_1: 'Tải kịch bản miễn phí từ thư viện thành viên',
    step_3_bullet_2: 'Tự thiết kế những màn trình diễn pháo hoa độc đáo',
    step_3_bullet_3: 'Chia sẻ kịch bản và nhận phản hồi cùng cộng đồng',
    step_3_action: 'Tham gia Facebook Group',

    // Audio Modal
    modal_badge: 'Bản quyền âm nhạc',
    modal_notice: 'Bạn có thể chọn tệp âm thanh có sẵn từ thiết bị của mình để phát đồng bộ, hoặc xem kịch bản pháo hoa trực tiếp kèm hiệu ứng âm thanh nổ 3D sống động.',
    modal_btn_choose: 'Chọn tệp MP3 từ máy của bạn',
    modal_btn_silent: 'Xem pháo hoa (không nhạc nền)',

    // Dynamic Status Strings
    status_fire_random: 'Đã phóng pháo hoa ngẫu nhiên',
    status_sound_muted: 'Đã tắt âm thanh pháo',
    status_sound_enabled: 'Đã bật âm thanh pháo',
    status_loading: 'Đang nạp: {name}...',
    status_playing_music: 'Đang biểu diễn: {name} (Đã nạp nhạc)',
    status_playing_3d: 'Đang biểu diễn: {name} (Âm thanh pháo 3D)',
    status_firing: 'Đang bắn: {type} {index}',
    status_completed: 'Show hoàn thành!',
    status_error: 'Lỗi nạp show: {msg}'
  },

  en: {
    // Nav & Common
    nav_community_title: 'Community & Social Links',
    nav_sound_on: 'Turn sound ON (currently OFF)',
    nav_sound_off: 'Turn sound OFF (currently ON)',
    nav_lang_title: 'Switch Language',
    nav_download_title: 'Download FDShowStudio (GitHub Releases)',

    // Side Nav Dots
    side_home: '01 Home',
    side_home_title: 'Block 1: FDShowStudio',
    side_exp: '02 Experience',
    side_exp_title: 'Block 2: Experience Arena',
    side_community: '03 Community',
    side_community_title: 'Block 3: Community & Join',

    // Block 1: Intro
    intro_badge: '3D Design Suite',
    intro_bullet_1: 'Firework choreography & timeline editor',
    intro_bullet_2: 'Dynamic 3D formation design for light drone swarms',
    intro_desc: 'Real-time 3D simulation with accurate pyrotechnic physics, automatic audio beat detection, and light trajectory orchestration for thousands of drones.',
    btn_download_new: 'Download Latest Release',
    btn_experience_now: 'Experience Live',
    video_label: 'Intro Video',
    scroll_prompt: 'Scroll down to experience',

    // Block 2: Experience Arena
    sky_hint: 'Click anywhere in the sky to launch fireworks',
    btn_close_dock_title: 'Hide Dock (Collapse)',
    scrubber_title: 'Click or drag to scrub show timeline',
    tab_shows: 'Show Scripts (5)',
    tab_big_shell: 'Big Shell (8)',
    tab_small_shell: 'Small Shell (26)',
    status_ready: '3D Sky Ready',
    btn_import_audio: 'Load MP3',
    btn_import_audio_title: 'Load MP3 audio file from your device',
    btn_sound_on: 'Sound: ON',
    btn_sound_off: 'Sound: OFF',
    btn_toggle_sound_title: 'Toggle firework sound effects',
    btn_fire_random: 'Fire Random',
    btn_fire_random_title: 'Launch random fireworks',
    btn_stop_show: 'Stop Show',
    btn_stop_show_title: 'Stop script or show',
    btn_play_show: 'Play Show',
    btn_playing_show: 'Stop',
    btn_dock_toggle: 'Scripts ∧',
    btn_dock_toggle_title: 'Reopen scripts dock',

    // Show Subtitles
    secret_base_sub: 'Emotional Ballad • 5m49s',
    blood_tear_sub: 'Intense & Dramatic • 4m05s',
    hanabi_sub: 'Vibrant Festival of Colors',
    lose_control_sub: 'Explosive Electronic Energy',
    monody_sub: 'Grand Fireworks Symphony',

    // Shell Chips
    shell_big_label: 'Shell',
    shell_chip_title: 'Detonate',

    // Block 3: Community
    comm_tag: 'Community & Participate',
    comm_title: 'Join the FDShowStudio Community',
    step_1_badge: 'STEP 1',
    step_1_heading: 'Download',
    step_1_bullet_1: 'Download latest release from official GitHub page',
    step_1_bullet_2: 'Launch desktop application directly on your PC',
    step_1_bullet_3: 'Explore interactive 3D choreography tools',
    step_1_action: 'Download for Windows',
    bridge_1: 'Learn how to use',
    step_2_badge: 'STEP 2',
    step_2_heading: 'Tutorials & Guides',
    step_2_bullet_1: 'Watch official FDShowStudio YouTube channel',
    step_2_bullet_2: 'Master timeline editing & automated beat-syncing',
    step_2_bullet_3: 'Learn optimization tips for 3D drone formations',
    step_2_action: 'YouTube Channel',
    bridge_2: 'Join the community',
    step_3_badge: 'STEP 3',
    step_3_heading: 'Join Community',
    step_3_bullet_1: 'Download free scripts from community library',
    step_3_bullet_2: 'Design your own custom firework & drone shows',
    step_3_bullet_3: 'Share choreography and receive feedback',
    step_3_action: 'Join Facebook Group',

    // Audio Modal
    modal_badge: 'Music Copyright',
    modal_notice: 'You can choose an existing audio file from your device to sync, or watch the fireworks directly with spatial 3D explosion sound effects.',
    modal_btn_choose: 'Choose MP3 File from Device',
    modal_btn_silent: 'Watch Fireworks (No BGM)',

    // Dynamic Status Strings
    status_fire_random: 'Random fireworks launched',
    status_sound_muted: 'Sound muted',
    status_sound_enabled: 'Sound enabled',
    status_loading: 'Loading: {name}...',
    status_playing_music: 'Playing: {name} (Audio loaded)',
    status_playing_3d: 'Playing: {name} (3D Sound effect)',
    status_firing: 'Firing: {type} {index}',
    status_completed: 'Show completed!',
    status_error: 'Error loading show: {msg}'
  },

  ja: {
    // Nav & Common
    nav_community_title: 'コミュニティ＆SNS',
    nav_sound_on: '花火の音声をオン（現在オフ）',
    nav_sound_off: '花火の音声をオフ（現在オン）',
    nav_lang_title: '言語を切り替える / Switch Language',
    nav_download_title: 'FDShowStudioをダウンロード (GitHub Releases)',

    // Side Nav Dots
    side_home: '01 ホーム',
    side_home_title: 'ブロック1: FDShowStudio',
    side_exp: '02 体験',
    side_exp_title: 'ブロック2: 3D体験エリア',
    side_community: '03 参加',
    side_community_title: 'ブロック3: コミュニティ',

    // Block 1: Intro
    intro_badge: '3Dデザインソフトウェア',
    intro_bullet_1: '花火ショーの設計・タイムライン編集ソフト',
    intro_bullet_2: 'ドローンライトショー編隊のモーション形状設計',
    intro_desc: '正確な火薬物理シミュレーション、自動音楽ビート検出、数千機のドローンの軌道アニメーションを備えたリアルタイム3Dシミュレーション。',
    btn_download_new: '最新版をダウンロード',
    btn_experience_now: '今すぐ体験する',
    video_label: '紹介動画',
    scroll_prompt: 'スクロールして体験',

    // Block 2: Experience Arena
    sky_hint: '夜空の任意の場所をクリックして花火を打ち上げます',
    btn_close_dock_title: '操作パネルを非表示（折りたたむ）',
    scrubber_title: 'クリックまたはドラッグしてシーク',
    tab_shows: 'ショースクリプト (5)',
    tab_big_shell: '大型花火 (8)',
    tab_small_shell: '小型花火 (26)',
    status_ready: '3Dスカイ準備完了',
    btn_import_audio: 'MP3読込',
    btn_import_audio_title: 'お使いの端末からMP3オーディオを読み込む',
    btn_sound_on: 'サウンド: ON',
    btn_sound_off: 'サウンド: OFF',
    btn_toggle_sound_title: '花火の効果音を切り替え',
    btn_fire_random: 'ランダム発射',
    btn_fire_random_title: 'ランダムに花火を打ち上げる',
    btn_stop_show: 'ショー停止',
    btn_stop_show_title: 'スクリプトまたはショーを停止',
    btn_play_show: 'ショー再生',
    btn_playing_show: '停止',
    btn_dock_toggle: 'スクリプト ∧',
    btn_dock_toggle_title: 'スクリプトパネルを開く',

    // Show Subtitles
    secret_base_sub: '感動のバラード • 5分49秒',
    blood_tear_sub: 'ドラマチック＆緊迫感 • 4分05秒',
    hanabi_sub: '色鮮やかなフェスティバル',
    lose_control_sub: '爆発的なエレクトロニックエネルギー',
    monody_sub: '壮大な花火シンフォニー',

    // Shell Chips
    shell_big_label: '花火',
    shell_chip_title: '点火',

    // Block 3: Community
    comm_tag: 'コミュニティ＆参加',
    comm_title: 'FDShowStudioに参加する',
    step_1_badge: 'ステップ 1',
    step_1_heading: 'ダウンロード',
    step_1_bullet_1: '公式リリースページから最新版をダウンロード',
    step_1_bullet_2: 'PCでアプリケーションを直接起動',
    step_1_bullet_3: '3D演出制作ツールの基本機能を体験',
    step_1_action: 'Windows版をダウンロード',
    bridge_1: '使い方をマスターする',
    step_2_badge: 'ステップ 2',
    step_2_heading: '使い方を学ぶ',
    step_2_bullet_1: '公式YouTubeチャンネルでチュートリアルを視聴',
    step_2_bullet_2: 'タイムライン編集と楽曲ビート同期をマスター',
    step_2_bullet_3: '3Dドローン編隊の最適化テクニックを学ぶ',
    step_2_action: 'YouTubeチャンネル',
    bridge_2: 'コミュニティに参加',
    step_3_badge: 'ステップ 3',
    step_3_heading: 'コミュニティ参加',
    step_3_bullet_1: 'メンバーライブラリから無料スクリプトを入手',
    step_3_bullet_2: '独自のオリジナル花火ショーをデザイン',
    step_3_bullet_3: 'スクリプトを共有して仲間とフィードバック',
    step_3_action: 'Facebookグループに参加',

    // Audio Modal
    modal_badge: '音楽の著作権',
    modal_notice: 'お手持ちの端末からオーディオファイルを選択して同期再生するか、迫力ある3D効果音で花火をそのまま鑑賞できます。',
    modal_btn_choose: '端末からMP3を選択',
    modal_btn_silent: '花火のみ鑑賞（BGMなし）',

    // Dynamic Status Strings
    status_fire_random: 'ランダム花火を打ち上げました',
    status_sound_muted: '花火音声をミュートしました',
    status_sound_enabled: '花火音声を有効にしました',
    status_loading: '読み込み中: {name}...',
    status_playing_music: '上演中: {name} (音楽読み込み済)',
    status_playing_3d: '上演中: {name} (3D効果音)',
    status_firing: '発射中: {type} {index}',
    status_completed: 'ショー完了！',
    status_error: 'ショー読み込みエラー: {msg}'
  },

  zh: {
    // Nav & Common
    nav_community_title: '社群與社交媒體',
    nav_sound_on: '開啟煙花音效（目前關閉）',
    nav_sound_off: '關閉煙花音效（目前開啟）',
    nav_lang_title: '切換語言 / Switch Language',
    nav_download_title: '下載 FDShowStudio (GitHub Releases)',

    // Side Nav Dots
    side_home: '01 首頁',
    side_home_title: '區塊 1: FDShowStudio',
    side_exp: '02 體驗',
    side_exp_title: '區塊 2: 3D體驗區',
    side_community: '03 社群',
    side_community_title: '區塊 3: 加入社群',

    // Block 1: Intro
    intro_badge: '3D 設計軟體',
    intro_bullet_1: '煙花表演設計與時間軸編輯器',
    intro_bullet_2: '無人機燈光秀編隊動態造型設計',
    intro_desc: '即時 3D 模擬，具備精準的煙火物理學、自動音樂節奏抓取，以及為數千架無人機編排的燈光軌跡動畫。',
    btn_download_new: '下載最新版本',
    btn_experience_now: '立即體驗',
    video_label: '介紹影片',
    scroll_prompt: '向下滾動以體驗',

    // Block 2: Experience Arena
    sky_hint: '點擊天空中任意位置以發射煙花',
    btn_close_dock_title: '隱藏面板 (收起)',
    scrubber_title: '點擊或拖動以跳轉時間',
    tab_shows: '表演劇本 (5)',
    tab_big_shell: '大型煙花 (8)',
    tab_small_shell: '小型煙花 (26)',
    status_ready: '3D天空就緒',
    btn_import_audio: '載入 MP3',
    btn_import_audio_title: '從您的裝置載入 MP3 音訊檔案',
    btn_sound_on: '音效: 開啟',
    btn_sound_off: '音效: 關閉',
    btn_toggle_sound_title: '開啟或關閉煙花音效',
    btn_fire_random: '隨機發射',
    btn_fire_random_title: '隨機發射煙花',
    btn_stop_show: '停止劇本',
    btn_stop_show_title: '停止當前劇本或表演',
    btn_play_show: '播放表演',
    btn_playing_show: '停止',
    btn_dock_toggle: '劇本 ∧',
    btn_dock_toggle_title: '重新打開劇本面板',

    // Show Subtitles
    secret_base_sub: '感人抒情曲 • 5分49秒',
    blood_tear_sub: '扣人心弦的節奏 • 4分05秒',
    hanabi_sub: '絢麗多彩的節慶盛會',
    lose_control_sub: '爆發性電子能量',
    monody_sub: '壯麗的煙花交響樂',

    // Shell Chips
    shell_big_label: '煙花',
    shell_chip_title: '點火',

    // Block 3: Community
    comm_tag: '社群與參與',
    comm_title: '加入 FDShowStudio 社群',
    step_1_badge: '步驟 1',
    step_1_heading: '下載',
    step_1_bullet_1: '在官方 GitHub 發行頁面下載最新版本',
    step_1_bullet_2: '在電腦上直接執行應用程式',
    step_1_bullet_3: '體驗基礎 3D 劇本創作工具',
    step_1_action: '下載 Windows 版',
    bridge_1: '學習如何使用',
    step_2_badge: '步驟 2',
    step_2_heading: '觀看教學',
    step_2_bullet_1: '觀看 FDShowStudio 官方 YouTube 頻道',
    step_2_bullet_2: '掌握時間軸編輯與音樂節奏對齊',
    step_2_bullet_3: '學習優化 3D 無人機編隊造型技巧',
    step_2_action: 'YouTube 頻道',
    bridge_2: '加入社群交流',
    step_3_badge: '步驟 3',
    step_3_heading: '加入社群',
    step_3_bullet_1: '從成員庫免費下載表演劇本',
    step_3_bullet_2: '親自設計獨一無二的煙花秀',
    step_3_bullet_3: '分享劇本並與社群共同交流反饋',
    step_3_action: '加入 Facebook 社團',

    // Audio Modal
    modal_badge: '音樂版權聲明',
    modal_notice: '您可以從您的裝置選擇現有的音訊檔案進行同步播放，或直接觀賞帶有生動 3D 爆炸音效的煙花秀。',
    modal_btn_choose: '從電腦選擇 MP3 檔案',
    modal_btn_silent: '觀賞煙花 (無背景音樂)',

    // Dynamic Status Strings
    status_fire_random: '已隨機發射煙花',
    status_sound_muted: '已靜音煙花音效',
    status_sound_enabled: '已開啟煙花音效',
    status_loading: '載入中: {name}...',
    status_playing_music: '演出中: {name} (已載入音樂)',
    status_playing_3d: '演出中: {name} (3D音效)',
    status_firing: '發射中: {type} {index}',
    status_completed: '表演已完成！',
    status_error: '載入劇本錯誤: {msg}'
  }
};

/**
 * Get translated text for a given key and language.
 */
export function t(key, lang = 'vi', params = {}) {
  const targetLang = translations[lang] ? lang : 'vi';
  let text = translations[targetLang][key] || translations['en']?.[key] || translations['vi']?.[key] || key;
  if (params && typeof params === 'object') {
    Object.keys(params).forEach((paramKey) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
    });
  }
  return text;
}

/**
 * Audio modal dynamic description formatting
 */
export function getAudioModalDesc(showName, audioFile, lang = 'vi') {
  switch (lang) {
    case 'en':
      return `This show script is synchronized with <strong>${showName}</strong> (${audioFile}). To respect international music copyright laws, MP3 files are not stored on our server.`;
    case 'ja':
      return `このショースクリプトは楽曲 <strong>${showName}</strong> (${audioFile}) と完全同期して制作されています。国際著作権法を遵守するため、MP3ファイルは当サーバー上に保存されておりません。`;
    case 'zh':
      return `此表演劇本與音樂 <strong>${showName}</strong> (${audioFile}) 同步編排。為尊重國際音樂版權法規，本站伺服器不儲存該 MP3 檔案。`;
    case 'vi':
    default:
      return `Kịch bản này được dàn dựng đồng bộ với bài hát <strong>${showName}</strong> (${audioFile}). Nhằm tôn trọng và tuân thủ bản quyền âm nhạc quốc tế, trang web không lưu trữ tệp MP3 này trên máy chủ.`;
  }
}

