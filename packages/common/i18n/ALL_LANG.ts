import { KEYS, i18nAllLang } from "./i18n-types";

const ALLLang: i18nAllLang = {
  [KEYS.save]: {
    'en-US': 'Save',
    'zh-CN': '保存',
    'ja': '保存',
    'ru': 'Сохранить'
  },
  [KEYS.comfyui_auto_install_deps]: {
    'zh-CN': '启动时自动安装依赖（会花更多时间）',
    'ja': '起動時に依存関係を自動的にインストールする（時間がかかります）',
    'ru': 'Автоматическая установка зависимостей при запуске (займет больше времени)',
    'en-US': 'Auto install dependencies on startup (will take more time)'
  },
  [KEYS.comfyui_extra_commands]: {
    'en-US': 'ComfyUI Extra Commands',
    'zh-CN': 'ComfyUI 额外命令',
    'ja': 'ComfyUI 追加コマンド',
    'ru': 'Дополнительные команды ComfyUI'
  },
  [KEYS.comfyui_preview_mode]: {
    'en-US': 'ComfyUI Preview Mode',
    'zh-CN': 'ComfyUI 预览模式',
    'ja': 'ComfyUI プレビューモード',
    'ru': 'Режим предпросмотра ComfyUI'
  },
  [KEYS.languageChangeNotice]: {
    'zh-CN': '为了支持编辑器内节点的翻译，请前往插件中心安装 AIGODLIKE-ComfyUI-Translation',
    'ja': "エディタ内のノードの翻訳をサポートするために、拡張センターに行って AIGODLIKE-ComfyUI-Translation をインストールしてください。",
    'ru': "Чтобы поддержать перевод узлов в редакторе, перейдите в центр расширений и установитеAIGODLIKE-ComfyUI-Translation.",
    'en-US': "To support the translation of nodes in the editor, please go to the extension center to install AIGODLIKE-ComfyUI-Translation"
  },
  [KEYS.community]: {
    'en-US': 'Community',
    'zh-CN': '社区',
    'ja': 'コミュニティ',
    'ru': 'Сообщество'
  },
  [KEYS.appName]: {
    'en-US': "comflowy",
    'zh-CN': "comflowy",
    'ja': "comflowy",
    'ru': "comflowy"
  },
  [KEYS.workflows]: {
    'en-US': "Workflows",
    'zh-CN': "工作流",
    'ja': "ワークフロー",
    'ru': "Рабочие процессы"
  },
  [KEYS.templates]: {
    'en-US': "Templates",
    'zh-CN': "模板",
    'ja': "テンプレート",
    'ru': "Шаблоны"
  },
  [KEYS.template]: {
    'en-US': "Template",
    'zh-CN': "模板",
    'ja': "テンプレート",
    'ru': "Шаблон"
  },
  [KEYS.chooseTemplate]: {
    'en-US': "Choose a template for creating your worklow",
    'zh-CN': "请选择一个模板来创建工作流",
    'ja': "テンプレートを選択して開始",
    'ru': "Сначала выберите шаблон"
  },
  [KEYS.tutorials]: {
    'en-US': "Tutorials",
    'zh-CN': "教程",
    'ja': "チュートリアル",
    'ru': "Обучающие материалы"
  },
  [KEYS.models]: {
    'en-US': 'Models',
    'zh-CN': '模型',
    'ja': 'モデル',
    'ru': 'Модели'
  },
  [KEYS.modelManagement]: {
    'en-US': 'Model Management',
    'zh-CN': '模型管理',
    'ja': 'モデル管理',
    'ru': 'Управление моделями'
  },
  [KEYS.modelFolder]: {
    'en-US': 'Model Folder',
    'zh-CN': '模型文件夹',
    'ja': 'モデルフォルダ',
    'ru': 'Папка моделей'
  },
  [KEYS.refresh]: {
    'en-US': 'Refresh',
    'zh-CN': '刷新',
    'ja': 'リフレッシュ',
    'ru': 'Обновить'
  },
  [KEYS.settings]: {
    'en-US': 'Settings',
    'zh-CN': '设置',
    'ja': '設定',
    'ru': 'Настройки'
  },
  [KEYS.available]: {
    'en-US': 'Available',
    'zh-CN': '可用',
    'ja': '利用可能',
    'ru': 'Доступно'
  },
  [KEYS.install]: {
    'en-US': 'Install',
    'zh-CN': '安装',
    'ja': 'インストール',
    'ru': 'Установить'
  },
  [KEYS.installed]: {
    'en-US': 'Installed',
    'zh-CN': '已安装',
    'ja': 'インストール済み',
    'ru': 'Установлено'
  },
  [KEYS.extensions]: {
    'en-US': 'Extensions',
    'zh-CN': '插件',
    'ja': '拡張機能',
    'ru': 'Расширения'
  },
  [KEYS.installedExtensions]: {
    'en-US': 'Installed Extensions',
    'zh-CN': '已安装的插件',
    'ja': 'インストール済みの拡張機能',
    'ru': 'Установленные расширения'
  },
  [KEYS.extensionsInstalled]: {
    'en-US': 'Extensions already installed on your device',
    'zh-CN': '设备上已安装的插件',
    'ja': 'デバイスにすでにインストールされている拡張機能',
    'ru': 'Расширения уже установлены на вашем устройстве'
  },
  [KEYS.communityExtensions]: {
    'en-US': 'Community Extensions',
    'zh-CN': '社区插件',
    'ja': 'コミュニティの拡張機能',
    'ru': 'Расширения от сообщества'
  },
  [KEYS.installExtensionsFromCommunity]: {
    'en-US': 'Install extensions from the community',
    'zh-CN': '从社区安装插件',
    'ja': 'コミュニティから拡張機能をインストール',
    'ru': 'Установить расширения от сообщества'
  },
  [KEYS.installFromGitUrl]: {
    'en-US': 'Install from Github URL',
    'zh-CN': '通过 Github URL 安装',
    'ja': 'Github URL からインストール',
    'ru': 'Установить из URL на Github'
  },
  [KEYS.totalExtensions]: {
    'en-US': 'Total Extensions',
    'zh-CN': '总插件数',
    'ja': '合計拡張機能',
    'ru': 'Всего расширений'
  },
  [KEYS.searchExtensions]: {
    'en-US': 'Search Extensions',
    'zh-CN': '搜索插件',
    'ja': '拡張機能を検索',
    'ru': 'Поиск расширений'
  },
  [KEYS.installExtensionsFromGithub]: {
    'en-US': 'Install Extensions From Github',
    'zh-CN': '从 Github 安装插件',
    'ja': 'Github から拡張機能をインストール',
    'ru': 'Установить расширения из Github'
  },
  [KEYS.inputGithubUrl]: {
    'en-US': 'Input extension Github url',
    'zh-CN': '输入插件 Github url',
    'ja': '拡張機能の Github URL を入力',
    'ru': 'Введите URL расширения на Github'
  },
  [KEYS.menu]: {
    'en-US': 'MENU',
    'zh-CN': '菜单',
    'ja': 'メニュー',
    'ru': 'МЕНЮ'
  },
  [KEYS.yes]: {
    'en-US': 'Yes',
    'zh-CN': '确定',
    'ja': 'はい',
    'ru': 'Да'
  },
  [KEYS.cancel]: {
    'en-US': 'Cancel',
    'zh-CN': '取消',
    'ja': 'キャンセル',
    'ru': 'Отмена'
  },
  [KEYS.disable]: {
    'en-US': 'Disable',
    'zh-CN': '禁用',
    'ja': '無効にする',
    'ru': 'Отключить'
  },
  [KEYS.enable]: {
    'en-US': 'Enable',
    'zh-CN': '启用',
    'ja': '有効にする',
    'ru': 'Включить'
  },
  [KEYS.update]: {
    'en-US': 'Update',
    'zh-CN': '更新',
    'ja': '更新',
    'ru': 'Обновить'
  },
  [KEYS.success]: {
    'en-US': 'Success',
    'zh-CN': '成功',
    'ja': '成功',
    'ru': 'Успешно'
  },
  [KEYS.createNewWorkflow]: {
    'en-US': 'Create New Workflow',
    'zh-CN': '创建新工作流',
    'ja': '新しいワークフローを作成',
    'ru': 'Создать новый рабочий процесс'
  },
  [KEYS.myWorkflows]: {
    'en-US': 'My Workflows',
    'zh-CN': '我的工作流',
    'ja': '私のワークフロー',
    'ru': 'Мои рабочие процессы'
  },
  [KEYS.chooseMethod]: {
    'en-US': 'Choose the method for creating your worklow',
    'zh-CN': '选择创建工作流的方法',
    'ja': 'ワークフローの作成方法を選択してください',
    'ru': 'Выберите метод создания вашего рабочего процесса'
  },
  [KEYS.newWorkflow]: {
    'en-US': 'New Workflow',
    'zh-CN': '新工作流',
    'ja': '新しいワークフロー',
    'ru': 'Новый рабочий процесс'
  },
  [KEYS.createDefaultWorkflow]: {
    'en-US': 'Create default workflow',
    'zh-CN': '创建默认工作流',
    'ja': 'デフォルトのワークフローを作成',
    'ru': 'Создать рабочий процесс по умолчанию'
  },
  [KEYS.import]: {
    'en-US': 'Import',
    'zh-CN': '导入',
    'ja': 'インポート',
    'ru': 'Импорт'
  },
  [KEYS.createFromImageOrJson]: {
    'en-US': 'Create from an image or JSON',
    'zh-CN': '从图像或 JSON 创建',
    'ja': '画像または JSON から作成',
    'ru': 'Создать из изображения или JSON'
  },
  [KEYS.selectTemplate]: {
    'en-US': 'Select a template to start',
    'zh-CN': '选择一个模板开始',
    'ja': 'テンプレートを選択して開始',
    'ru': 'Сначала выберите шаблон'
  },
  [KEYS.remove]: {
    'en-US': 'Remove',
    'zh-CN': '删除',
    'ja': '削除',
    'ru': 'Удалить'
  },
  [KEYS.deleteWorkflow]: {
    'en-US': 'Do you want to delete this workflow?',
    'zh-CN': '你是否要删除此工作流？',
    'ja': 'このワークフローを削除しますか？',
    'ru': 'Вы хотите удалить этот рабочий процесс?'
  },
  [KEYS.fundamentals]: {
    'en-US': 'Fundamentals',
    'zh-CN': '基础',
    'ja': '基本',
    'ru': 'Основы'
  },
  [KEYS.fundamentalsDesc]: {
    'en-US': 'I strongly suggest that you first learn the fundamentals of Stable Diffusion. This will give you a better understanding of the principles behind AI image generation, and you will be able to use Comflowy more effectively:',
    'zh-CN': '我强烈建议你先学习稳定扩散的基础知识。这将使你更好地理解 AI 图像生成背后的原理，并让你能够更好地使用 Comflowy：',
    'ja': 'まず、Stable Diffusion の基本を学ぶことを強くお勧めします。これにより、AI 画像生成の原則をよりよく理解し、Comflowy をより効果的に使用できるようになります：',
    'ru': 'Мы настоятельно рекомендуем вам сначала изучить основы стабильной диффузии. Это позволит вам лучше понять принципы создания изображений с использованием искусственного интеллекта, и вы сможете использовать Comflowy более эффективно:'
  },
  [KEYS.textToImage]: {
    'en-US': 'Text To Image',
    'zh-CN': '文本转图像',
    'ja': 'テキストから画像',
    'ru': 'Текст в изображение'
  },
  [KEYS.textToImageDesc]: {
    'en-US': 'If you\'re interested in further learning about text-to-image generation techniques, you can check out the following sections:',
    'zh-CN': '如果你对进一步了解文本到图像生成技术感兴趣，你可以查看以下部分：',
    'ja': 'テキストから画像を生成する技術についてさらに学びたい場合は、次のセクションをご覧ください：',
    'ru': 'Если вас интересует дальнейшее изучение технологии генерации текста в изображение, вы можете ознакомиться с следующими разделами:'
  },
  [KEYS.imageToImage]: {
    'en-US': 'Image To Image',
    'zh-CN': '图像转图像',
    'ja': '画像から画像',
    'ru': 'Изображение в изображение'
  },
  [KEYS.imageToImageDesc]: {
    'en-US': 'If you\'d like to learn some image-to-image generation techniques, you can check out the following sections:',
    'zh-CN': '如果你想了解一些图像到图像生成技术，你可以查看以下部分：',
    'ja': 'いくつかの画像から画像を生成する技術を学びたい場合は、次のセクションをご覧ください：',
    'ru': 'Если вы хотите лучше изучить технологию генерации изображения в изображение, вы можете ознакомиться с следующими разделами:'
  },
  [KEYS.bestPractices]: {
    'en-US': 'Best Practices',
    'zh-CN': '最佳实践',
    'ja': 'ベストプラクティス',
    'ru': 'Лучшие примеры'
  },
  [KEYS.bestPracticesDesc]: {
    'en-US': 'In addition to the basic tutorials, there are also some best practice cases that you can refer to and try out:',
    'zh-CN': '除了基础教程外，还有一些最佳实践案例供你参考和尝试：',
    'ja': '基本的なチュートリアルに加えて、参照して試してみることができるベストプラクティスのケースもあります：',
    'ru': 'Помимо основных примеров, есть также и другие примеры, которые вы можете посмотреть и попробовать:'
  },
  [KEYS.comfyUIProcessTerminal]: {
    'en-US': 'ComfyUI Process Terminal',
    'zh-CN': 'ComfyUI 进程终端',
    'ja': 'ComfyUI プロセスターミナル',
    'ru': 'Окно терминала ComfyUI'
  },
  [KEYS.stopServer]: {
    'en-US': 'Stop Server',
    'zh-CN': '停止服务器',
    'ja': 'サーバーを停止',
    'ru': 'Остановить сервер'
  },
  [KEYS.restart]: {
    'en-US': 'Restart',
    'zh-CN': '重启',
    'ja': '再起動',
    'ru': 'Перезапустить'
  },
  [KEYS.pipInstall]: {
    'en-US': 'Pip Install',
    'zh-CN': 'Pip 安装',
    'ja': 'Pip インストール',
    'ru': 'Установка с помошью PIP'
  },
  [KEYS.copyMessages]: {
    'en-US': 'Copy Messages',
    'zh-CN': '复制消息',
    'ja': 'メッセージをコピー',
    'ru': 'Скопировать сообщения'
  },
  [KEYS.installPip]: {
    'en-US': 'Install Pip Packages',
    'zh-CN': '安装 Pip 包',
    'ja': 'Pip パッケージをインストール',
    'ru': 'Установить пакеты с помощью PIP'
  },
  [KEYS.pipPlaceholder]: {
    'en-US': 'Input pip package name e.g. numpy pandas tensorflow',
    'zh-CN': '输入 pip 包名称，例如 numpy pandas tensorflow',
    'ja': 'pip パッケージ名を入力してください 例：numpy pandas tensorflow',
    'ru': 'Введите имя пакета для pip, например numpy pandas tensorflow'
  },
  [KEYS.appSettings]: {
    'en-US': 'App Settings',
    'zh-CN': '应用设置',
    'ja': 'アプリの設定',
    'ru': 'Настройки приложения'
  },
  [KEYS.general]: {
    'en-US': 'General',
    'zh-CN': '通用',
    'ja': '一般',
    'ru': 'Общие'
  },
  [KEYS.about]: {
    'en-US': 'About',
    'zh-CN': '关于',
    'ja': '約',
    'ru': 'О нас'
  },
  [KEYS.language]: {
    'en-US': 'Language',
    'zh-CN': '显示语言',
    'ja': '言語',
    'ru': 'Язык'
  },
  [KEYS.startupSettings]: {
    'en-US': 'Startup Settings',
    'zh-CN': '启动设置',
    'ja': '起動設定',
    'ru': 'Настройки запуска'
  },
  [KEYS.floatingPointPrecision]: {
    'en-US': 'Floating Point Precision: ',
    'zh-CN': '浮点数精度：',
    'ja': '浮動小数点精度：',
    'ru': 'Точность с плавающей точкой: '
  },
  [KEYS.vaePrecision]: {
    'en-US': 'VAE Precision: ',
    'zh-CN': 'VAE 精度：',
    'ja': 'VAE 精度：',
    'ru': 'Точность VAE: '
  },
  [KEYS.sdWebUIPath]: {
    'en-US': 'SD Web UI Path',
    'zh-CN': 'SD Web UI 路径',
    'ja': 'SD Web UI パス',
    'ru': 'Путь к SD Web UI'
  },
  [KEYS.sdWebUIPathDesc]: {
    'en-US': 'If you already installed SD WebUI, you can choose the SD WebUI path to reuse models.',
    'zh-CN': '如果你已经安装了 SD WebUI，你可以选择 SD WebUI 路径来复用模型。',
    'ja': 'すでに SD WebUI をインストールしている場合、SD WebUI パスを選択してモデルを再利用できます。',
    'ru': 'Если вы уже установили SD WebUI, вы можете выбрать путь к SD WebUI для повторного использования моделей.'
  },
  [KEYS.changeLocation]: {
    'en-US': 'Change Location',
    'zh-CN': '更改路径',
    'ja': '場所を変更',
    'ru': 'Изменить расположение'
  },
  [KEYS.version]: {
    'en-US': 'Version: ',
    'zh-CN': '版本：',
    'ja': 'バージョン：',
    'ru': 'Версия: '
  },
  [KEYS.links]: {
    'en-US': 'Links',
    'zh-CN': '链接',
    'ja': 'リンク',
    'ru': 'Ссылки'
  },
  [KEYS.changelog]: {
    'en-US': '• Product change log',
    'zh-CN': '• 产品更新日志',
    'ja': '• 製品の変更履歴',
    'ru': '• Журнал изменений продукта'
  },
  [KEYS.star]: {
    'en-US': '← If you like Comflowy, give our repo a ⭐',
    'zh-CN': '← 如果你喜欢 Comflowy，请给我们的仓库一个 ⭐',
    'ja': '← Comflowy が好きなら、リポジトリに ⭐ を付けてください',
    'ru': '← Если вам нравится Comflowy, поставьте нашему репозиторию ⭐'
  },
  [KEYS.communityDesc]: {
    'en-US': 'Have an idea, feature request or found a bug? Let us know, and we\'ll take a look at it!',
    'zh-CN': '有想法、功能请求或发现了一个 bug？告诉我们，我们会帮你解决！',
    'ja': 'アイデア、機能のリクエスト、バグを見つけましたか？お知らせください、私たちが見てみます！',
    'ru': 'Есть идея, запрос функции или найдена ошибка? Дайте нам знать, и мы обратим внимание на это!'
  },
  [KEYS.joinDiscordCommunity]: {
    'en-US': 'Join Discord Community',
    'zh-CN': '加入 Discord 社区',
    'ja': 'Discord コミュニティに参加',
    'ru': 'Присоединиться к сообществу в Discord'
  },
  [KEYS.confyuiNotStarted]: {
    'en-US': 'ComfyUI Server may not started, check the server status',
    'zh-CN': 'ComfyUI 服务器可能未启动，请检查服务器状态',
    'ja': 'ComfyUI サーバーが起動していない可能性があります。サーバーの状態を確認してください',
    'ru': 'Сервер ComfyUI не может быть запущен, проверьте статус сервера'
  },
  [KEYS.resetViaFile]: {
    'en-US': 'Reset via workflow file',
    'zh-CN': '通过工作流文件重置',
    'ja': 'ワークフローファイルを使用してリセット',
    'ru': 'Сброс используя файл рабочего процесса'
  },
  [KEYS.resetViaDefault]: {
    'en-US': 'Reset via default workflow',
    'zh-CN': '通过默认工作流重置',
    'ja': 'デフォルトのワークフローを使用してリセット',
    'ru': 'Сброс на рабочий процесс "по умолчанию"'
  },
  [KEYS.exportWorkflow]: {
    'en-US': 'Export Workflow',
    'zh-CN': '导出工作流',
    'ja': 'ワークフローをエクスポート',
    'ru': 'Экспорт рабочего процесса'
  },
  [KEYS.failedToExportWorkflow]: {
    'en-US': 'Failed to export workflow: ',
    'zh-CN': '导出工作流失败: ',
    'ja': 'ワークフローのエクスポートに失敗しました: ',
    'ru': 'Не удалось экспортировать рабочий процесс: '
  },
  [KEYS.file]: {
    'en-US': 'File',
    'zh-CN': '文件',
    'ja': 'ファイル',
    'ru': 'Файл'
  },
  [KEYS.notifications]: {
    'en-US': 'Notifications',
    'zh-CN': '通知',
    'ja': 'メッセージ',
    'ru': 'Сообщения'
  },
  [KEYS.controlboard]: {
    'en-US': 'Controlboard',
    'zh-CN': '控制面板',
    'ja': 'コントロールボード',
    'ru': 'Панель управления'
  },
  [KEYS.clickToReloadApp]: {
    'en-US': 'Click to reload app',
    'zh-CN': '点击重新加载应用',
    'ja': 'クリックしてアプリを再読み込み',
    'ru': 'Нажмите, чтобы перезагрузить приложение'
  },
  [KEYS.clickToEditTitle]: {
    'en-US': 'Click to edit title',
    'zh-CN': '点击编辑标题',
    'ja': 'クリックしてタイトルを編集',
    'ru': 'Нажмите, чтобы изменить заголовок'
  },
  [KEYS.clickToStopExecution]: {
    'en-US': 'Click to stop execution',
    'zh-CN': '点击停止执行插件',
    'ja': 'クリックして実行を停止',
    'ru': 'Нажмите, чтобы остановить выполнение'
  },
  [KEYS.clickToRunWorkflow]: {
    'en-US': 'Click to run workflow',
    'zh-CN': '点击运行工作流',
    'ja': 'ワークフローを実行するにはクリック',
    'ru': 'Нажмите, чтобы запустить рабочий процесс'
  },
  [KEYS.clickToOpenControlboard]: {
    'en-US': 'Click to open controlboard',
    'zh-CN': '点击打开控制面板',
    'ja': 'クリックしてコントロールボードを開く',
    'ru': 'Нажмите, чтобы открыть панель управления'
  },
  [KEYS.clickToShowExecutionMessages]: {
    'en-US': 'Click to show execution messages',
    'zh-CN': '点击显示执行消息',
    'ja': 'クリックして実行メッセージを表示',
    'ru': 'Нажмите, чтобы показать сообщения выполнения'
  },
  [KEYS.toggleSelectMode]: {
    'en-US': 'Toggle select mode',
    'zh-CN': '切换选择模式',
    'ja': '選択モードを切り替える',
    'ru': 'Переключить режим'
  },
  [KEYS.addNewNode]: {
    'en-US': 'Add new node',
    'zh-CN': '添加新节点',
    'ja': '新しいノードを追加',
    'ru': 'Добавить новый узел'
  },
  [KEYS.gallery]: {
    'en-US': 'Gallery',
    'zh-CN': '历史图片',
    'ja': 'ギャラリー',
    'ru': 'Галерея'
  },
  [KEYS.executionQueue]: {
    'en-US': 'Execution Queue',
    'zh-CN': '执行队列',
    'ja': '実行キュー',
    'ru': 'Очередь выполнения'
  },
};

export default ALLLang;