import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface FileItemDetail {
  name: string;
  size: number;
  humanSize: string;
  category: 'frontend' | 'backend' | 'wordpress' | 'docs' | 'config';
  status: 'pending' | 'ready' | 'compressed';
}

export interface ZipProgressInfo {
  stage: 'idle' | 'fetching' | 'packaging' | 'compressing' | 'completed' | 'error';
  stageTitleFa: string;
  stageTitleEn: string;
  stageDescriptionFa: string;
  stageDescriptionEn: string;
  percent: number; // 0 - 100
  currentFile: string;
  totalFilesCount: number;
  processedFilesCount: number;
  totalRawBytes: number;
  humanRawSize: string;
  finalZipSize?: number;
  humanZipSize?: string;
  speedText?: string;
  filesList: FileItemDetail[];
  error?: string;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes <= 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function generateAndDownloadZipPackage(
  _type: 'all' | 'php' | 'wordpress' | 'node' = 'all',
  onProgress?: (info: ZipProgressInfo) => void
): Promise<{ blob: Blob; filename: string; totalBytes: number }> {
  const zip = new JSZip();
  let totalRawBytes = 0;
  const filesList: FileItemDetail[] = [];

  const update = (partial: Partial<ZipProgressInfo>) => {
    if (!onProgress) return;
    onProgress({
      stage: partial.stage || 'fetching',
      stageTitleFa: partial.stageTitleFa || '',
      stageTitleEn: partial.stageTitleEn || '',
      stageDescriptionFa: partial.stageDescriptionFa || '',
      stageDescriptionEn: partial.stageDescriptionEn || '',
      percent: Math.min(100, Math.max(0, Math.round(partial.percent || 0))),
      currentFile: partial.currentFile || '',
      totalFilesCount: filesList.length || 10,
      processedFilesCount: filesList.filter((f) => f.status !== 'pending').length,
      totalRawBytes,
      humanRawSize: formatBytes(totalRawBytes),
      finalZipSize: partial.finalZipSize,
      humanZipSize: partial.finalZipSize ? formatBytes(partial.finalZipSize) : undefined,
      filesList: [...filesList],
      error: partial.error,
    });
  };

  try {
    // ----------------------------------------------------
    // STAGE 1: Collect & Fetch Frontend Production Bundles
    // ----------------------------------------------------
    update({
      stage: 'fetching',
      stageTitleFa: 'در حال دریافت فایل‌های کامپایل‌شده فرانت‌اند',
      stageTitleEn: 'Fetching Compiled Frontend Production Bundles',
      stageDescriptionFa: 'دریافت باندل کامل React + Tailwind + Lucide Icons و فایل‌های استاتیک...',
      stageDescriptionEn: 'Downloading compiled React app.js, app.css, and single-page dashboard...',
      percent: 10,
      currentFile: 'assets/app.js',
    });

    // 1.1 index.html
    const indexHtml = `<!doctype html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>omni chat — پلتفرم چت آنلاین و پشتیبانی سازمانی</title>
    <meta name="description" content="omni chat — سامانه گفتگوی آنلاین حرفه‌ای، سلف‌هاستد و سازمانی با رابط کاربری تلگرام / iOS و استقلال ۱۰۰٪" />
    <meta property="og:title" content="omni chat — پلتفرم چت آنلاین و پشتیبانی سازمانی" />
    <meta property="og:description" content="omni chat — سامانه گفتگوی آنلاین حرفه‌ای با استقلال ۱۰۰٪" />
    <meta property="og:type" content="website" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script type="module" crossorigin src="./assets/app.js"></script>
    <link rel="stylesheet" crossorigin href="./assets/app.css">
  </head>
  <body class="bg-zinc-50 text-zinc-900 antialiased selection:bg-[#007AFF] selection:text-white">
    <div id="root"></div>
  </body>
</html>`;

    const indexHtmlSize = new Blob([indexHtml]).size;
    totalRawBytes += indexHtmlSize;
    zip.file('index.html', indexHtml);
    filesList.push({
      name: 'index.html',
      size: indexHtmlSize,
      humanSize: formatBytes(indexHtmlSize),
      category: 'frontend',
      status: 'ready',
    });

    // 1.2 Fetch assets/app.css & assets/app.js
    let cssText = '';
    let jsBlob: Blob | null = null;

    try {
      const [cssRes, jsRes] = await Promise.all([
        fetch('./assets/app.css'),
        fetch('./assets/app.js'),
      ]);

      if (cssRes.ok) {
        cssText = await cssRes.text();
        const size = new Blob([cssText]).size;
        totalRawBytes += size;
        zip.file('assets/app.css', cssText);
        filesList.push({
          name: 'assets/app.css',
          size,
          humanSize: formatBytes(size),
          category: 'frontend',
          status: 'ready',
        });
      }

      if (jsRes.ok) {
        jsBlob = await jsRes.blob();
        const size = jsBlob.size;
        totalRawBytes += size;
        zip.file('assets/app.js', jsBlob);
        filesList.push({
          name: 'assets/app.js',
          size,
          humanSize: formatBytes(size),
          category: 'frontend',
          status: 'ready',
        });
      }
    } catch (err) {
      console.warn('Could not fetch compiled assets via network:', err);
    }

    update({
      stage: 'packaging',
      stageTitleFa: 'در حال بسته‌بندی موتور بک‌اند PHP و دیتابیس MySQL',
      stageTitleEn: 'Packaging PHP Core REST API & MySQL Engine',
      stageDescriptionFa: 'افزودن وب‌سرویس REST API، موتور سبک SSE، اسکریپت نصب خودکار و ویجت چت...',
      stageDescriptionEn: 'Embedding api.php, db.php, stream.php, install.php, and client widget...',
      percent: 35,
      currentFile: 'backend/php/api.php',
    });

    // ----------------------------------------------------
    // STAGE 2: Fetch and Embed PHP Core Files
    // ----------------------------------------------------
    try {
      const [dbRes, apiRes, streamRes, installRes, widgetRes] = await Promise.all([
        fetch('./backend/php/db.php'),
        fetch('./backend/php/api.php'),
        fetch('./backend/php/stream.php'),
        fetch('./backend/php/install.php'),
        fetch('./backend/php/widget.min.js'),
      ]);

      const dbText = dbRes.ok ? await dbRes.text() : '';
      const apiText = apiRes.ok ? await apiRes.text() : '';
      const streamText = streamRes.ok ? await streamRes.text() : '';
      const installText = installRes.ok ? await installRes.text() : '';
      const widgetText = widgetRes.ok ? await widgetRes.text() : '';

      const phpFiles = [
        { name: 'db.php', content: dbText, cat: 'backend' as const },
        { name: 'api.php', content: apiText, cat: 'backend' as const },
        { name: 'stream.php', content: streamText, cat: 'backend' as const },
        { name: 'install.php', content: installText, cat: 'config' as const },
        { name: 'widget.min.js', content: widgetText, cat: 'frontend' as const },
      ];

      const phpFolder = zip.folder('backend/php');

      for (const item of phpFiles) {
        if (item.content) {
          const sz = new Blob([item.content]).size;
          totalRawBytes += sz;
          zip.file(item.name, item.content);
          phpFolder?.file(item.name, item.content);
          filesList.push({
            name: `backend/php/${item.name}`,
            size: sz,
            humanSize: formatBytes(sz),
            category: item.cat,
            status: 'ready',
          });
        }
      }
    } catch (err) {
      console.warn('Could not fetch PHP files via network:', err);
    }

    // ----------------------------------------------------
    // STAGE 3: WordPress Plugin & Complete Documentation
    // ----------------------------------------------------
    update({
      stage: 'packaging',
      stageTitleFa: 'در حال ایجاد افزونه وردپرس و اسناد راه‌اندازی',
      stageTitleEn: 'Generating WordPress Plugin & Setup Documentation',
      stageDescriptionFa: 'ساخت پلاگین بومی بدون وابستگی وردپرس و فایل‌های پیکربندی...',
      stageDescriptionEn: 'Creating standalone WordPress plugin and deployment manual...',
      percent: 50,
      currentFile: 'backend/wordpress/omni-chat.php',
    });

    const wpPlugin = `<?php
/**
 * Plugin Name: OmniChat Self-Hosted Live Support
 * Plugin URI: https://your-domain.com
 * Description: افزونه کاملاً مستقل و بومی چت آنلاین بدون اتصال به سرور شخص ثالث.
 * Version: 3.5.0
 * Author: OmniChat Enterprise
 */
if (!defined('ABSPATH')) { exit; }

class OmniChat_WP_Plugin {
    public function __construct() {
        add_action('wp_footer', [$this, 'inject_widget_script']);
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
    }
    public function inject_widget_script() {
        $server_url = get_option('omnichat_server_url', site_url('/omnichat'));
        ?>
        <script>
            window.OmniChatConfig = { endpoint: "<?php echo esc_url($server_url); ?>" };
            (function(d, s, u) {
                var js = d.createElement(s); js.async = true; js.defer = true;
                js.src = u + '/widget.min.js';
                var h = d.getElementsByTagName(s)[0]; h.parentNode.insertBefore(js, h);
            })(document, 'script', "<?php echo esc_url($server_url); ?>");
        </script>
        <?php
    }
    public function add_admin_menu() {
        add_menu_page('چت آنلاین OmniChat', 'چت آنلاین', 'manage_options', 'omnichat-settings', [$this, 'render_admin_page'], 'dashicons-format-chat', 30);
    }
    public function register_settings() {
        register_setting('omnichat_options', 'omnichat_server_url');
    }
    public function render_admin_page() {
        $server_url = get_option('omnichat_server_url', site_url('/omnichat'));
        ?>
        <div class="wrap" style="max-width: 800px; direction: rtl;">
            <h1>تنظیمات افزونه مستقل چت آنلاین OmniChat</h1>
            <p>این افزونه کاملاً روی هاست شما میزبانی می‌شود و هیچ اطلاعاتی به سرورهای خارجی ارسال نمی‌گردد.</p>
            <form method="post" action="options.php">
                <?php settings_fields('omnichat_options'); do_settings_sections('omnichat_options'); ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">آدرس اسکریپت چت روی هاست:</th>
                        <td>
                            <input type="text" name="omnichat_server_url" value="<?php echo esc_attr($server_url); ?>" class="regular-text" style="direction: ltr;" />
                            <p class="description">آدرس پوشه‌ای که فایل‌های اسکریپت را در آن آپلود کرده‌اید (مثلاً: https://site.com/chat).</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button('ذخیره تنظیمات'); ?>
            </form>
            <hr style="margin: 30px 0;">
            <a href="<?php echo esc_url($server_url . '/index.html'); ?>" target="_blank" class="button button-primary" style="padding: 6px 18px; font-size: 14px;">ورود به پنل مدیریت و پاسخگویی به چت‌ها</a>
        </div>
        <?php
    }
}
new OmniChat_WP_Plugin();
`;

    const wpSize = new Blob([wpPlugin]).size;
    totalRawBytes += wpSize;
    const wpFolder = zip.folder('backend/wordpress');
    wpFolder?.file('omni-chat.php', wpPlugin);
    filesList.push({
      name: 'backend/wordpress/omni-chat.php',
      size: wpSize,
      humanSize: formatBytes(wpSize),
      category: 'wordpress',
      status: 'ready',
    });

    const readmeContent = `# پکیج محصول تجاری و سلف‌هاستد OmniChat (کامل و کامپایل‌شده)

این پکیج شامل تمام کدهای کامپایل‌شده واقعی فرانت‌اند (React 19 + Tailwind CSS) و بک‌اند کامل PHP + MySQL است. بدون نیاز به Node.js روی هاست خریدار.

## 📁 ساختار فایل‌های پروژه داخل آرشیو:
- **\`index.html\`**: فایل صفحه اصلی پنل پیشرفته مدیریت و پاسخگویی به چت‌ها
- **\`assets/app.js\`**: باندل جاوا اسکریپت کامل کامپایل‌شده (~1 MB)
- **\`assets/app.css\`**: تمام کدهای استایل و رابط کاربری (~75 KB)
- **\`install.php\`**: ویزارد تحت وب نصب و ساخت خودکار جداول پایگاه‌داده با یک کلیک
- **\`db.php\`**: اتصال ایمن PDO با Connection Pooling
- **\`api.php\`**: کلیه Endpointهای REST API با احراز هویت توکنی و کنترل سطح دسترسی RBAC
- **\`stream.php\`**: موتور Realtime فوق‌کم‌مصرف Zero-Load (سازگار با هاست اشتراکی)
- **\`widget.min.js\`**: اسکریپت سبک شناور برای قرارگیری در سایت مشتری
- **\`backend/wordpress/omni-chat.php\`**: پلاگین مستقل وردپرس و ووکامرس

## 🚀 راهنمای راه‌اندازی سریع در ۲ مرحله:
1. فایل‌های فشرده را داخل پوشه دلخواه در هاست خود (مانند \`public_html/chat\`) اکسترکت کنید.
2. آدرس \`install.php\` را در مرورگر باز کنید، مشخصات دیتابیس MySQL و رمز دلخواه مدیر را وارد نمایید.
3. بلافاصله با ورود به \`index.html\` از پنل چت لذت ببرید!
`;

    const readmeSize = new Blob([readmeContent]).size;
    totalRawBytes += readmeSize;
    zip.file('README.md', readmeContent);
    filesList.push({
      name: 'README.md',
      size: readmeSize,
      humanSize: formatBytes(readmeSize),
      category: 'docs',
      status: 'ready',
    });

    // ----------------------------------------------------
    // STAGE 4: Real-time Deflate Compression (JSZip generateAsync)
    // ----------------------------------------------------
    update({
      stage: 'compressing',
      stageTitleFa: 'در حال فشرده‌سازی نهایی فایل ZIP با متد Deflate',
      stageTitleEn: 'Compressing Final ZIP Package with Deflate',
      stageDescriptionFa: 'فشرده‌سازی فایل‌ها و بهینه‌سازی حجم نهایی پکیج دانلودی...',
      stageDescriptionEn: 'Compressing and optimizing binary stream for instant download...',
      percent: 55,
      currentFile: 'assets/app.js',
    });

    const zipBlob = await zip.generateAsync(
      {
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6,
        },
      },
      (metadata) => {
        const zipPercent = 55 + Math.round((metadata.percent * 0.4)); // Scale 55% -> 95%
        update({
          stage: 'compressing',
          stageTitleFa: 'در حال فشرده‌سازی و پردازش لایو آرشیو',
          stageTitleEn: 'Compressing & Finalizing ZIP Archive',
          stageDescriptionFa: `در حال فشرده‌سازی: ${metadata.currentFile || 'بسته‌های کامپایل‌شده'}`,
          stageDescriptionEn: `Compressing: ${metadata.currentFile || 'compiled packages'}`,
          percent: zipPercent,
          currentFile: metadata.currentFile || 'assets/app.js',
        });
      }
    );

    // ----------------------------------------------------
    // STAGE 5: Completed & Trigger Browser Download
    // ----------------------------------------------------
    const filename = `omnichat-commercial-standalone-product-v3.5.zip`;

    update({
      stage: 'completed',
      stageTitleFa: 'پکیج آماده شد! دانلود فایل آغاز گردید',
      stageTitleEn: 'Package Ready! Download Started',
      stageDescriptionFa: `فایل زیپ نهایی با حجم ${formatBytes(zipBlob.size)} تولید و در مرورگر ذخیره شد.`,
      stageDescriptionEn: `Final ZIP package (${formatBytes(zipBlob.size)}) generated and saved.`,
      percent: 100,
      currentFile: filename,
      finalZipSize: zipBlob.size,
    });

    // Trigger saveAs
    saveAs(zipBlob, filename);

    return {
      blob: zipBlob,
      filename,
      totalBytes: zipBlob.size,
    };
  } catch (err: any) {
    console.error('ZIP Generation Error:', err);
    update({
      stage: 'error',
      stageTitleFa: 'خطا در ساخت پکیج ZIP',
      stageTitleEn: 'Error Generating ZIP Package',
      stageDescriptionFa: err.message || 'مشکلی در فشرده‌سازی فایل‌ها پیش آمد.',
      stageDescriptionEn: err.message || 'An error occurred during ZIP creation.',
      percent: 0,
      error: err.message || String(err),
    });
    throw err;
  }
}
