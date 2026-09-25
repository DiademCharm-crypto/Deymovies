import UIKit
import WebKit

// DEYMFLIX iOS — single-activity equivalent of the Android app:
// splash -> WKWebView on deymflix.eu.cc with the DeymflixApp JS bridge.
// Fullscreen button on the site hands the stream to the native AVPlayer.

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    static var shared: AppDelegate { UIApplication.shared.delegate as! AppDelegate }

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        window = UIWindow(frame: UIScreen.main.bounds)
        window?.rootViewController = SplashViewController()
        window?.makeKeyAndVisible()
        return true
    }
}

// MARK: - Splash (dark tile + spinning ring with red dot, like app.html)

final class SplashViewController: UIViewController {
    private let tile = UIView()
    private let ring = UIView()
    private let dot = UIView()
    private var hexView: HexIconView?

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.043, green: 0.043, blue: 0.059, alpha: 1)

        let side: CGFloat = min(view.bounds.width, view.bounds.height) / 2.4

        // spinning square ring with the red dot (site: .ring / .ring::before)
        ring.frame = CGRect(x: 0, y: 0, width: side * 1.24, height: side * 1.24)
        ring.center = view.center
        ring.layer.borderWidth = 1
        ring.layer.borderColor = UIColor(red: 0.898, green: 0.035, blue: 0.153, alpha: 0.35).cgColor
        dot.frame = CGRect(x: ring.bounds.midX - 4, y: -4, width: 8, height: 8)
        dot.layer.cornerRadius = 4
        dot.backgroundColor = UIColor(red: 1.0, green: 0.118, blue: 0.153, alpha: 1)
        dot.layer.shadowColor = dot.backgroundColor?.cgColor
        dot.layer.shadowRadius = 6
        dot.layer.shadowOpacity = 0.9
        ring.addSubview(dot)
        view.addSubview(ring)

        // dark rounded tile with the hexagon icon
        tile.frame = CGRect(x: 0, y: 0, width: side, height: side)
        tile.center = view.center
        tile.layer.cornerRadius = side * 0.22
        tile.backgroundColor = UIColor(red: 0.078, green: 0.078, blue: 0.078, alpha: 1)
        tile.layer.shadowColor = UIColor(red: 0.898, green: 0.035, blue: 0.153, alpha: 1).cgColor
        tile.layer.shadowRadius = 30
        tile.layer.shadowOpacity = 0.35
        let hex = HexIconView(frame: tile.bounds.insetBy(dx: side * 0.18, dy: side * 0.18))
        tile.addSubview(hex)
        hexView = hex
        view.addSubview(tile)

        // float the tile (site: float 5s), spin the ring (site: spin 14s)
        UIView.animate(withDuration: 2.5, delay: 0, options: [.repeat, .autoreverse, .curveEaseInOut]) {
            self.tile.transform = CGAffineTransform(translationX: 0, y: -12)
        }
        UIView.animate(withDuration: 14, delay: 0, options: [.repeat, .curveLinear]) {
            self.ring.transform = CGAffineTransform(rotationAngle: .pi * 2)
        }

        // wordmark
        let label = UILabel()
        label.text = "DEYMFLIX"
        label.textColor = .white
        label.font = UIFont.systemFont(ofSize: 30, weight: .bold)
        label.textAlignment = .center
        label.frame = CGRect(x: 0, y: 0, width: 260, height: 40)
        label.center = CGPoint(x: view.center.x, y: tile.frame.maxY + 48)
        view.addSubview(label)

        // 2 seconds (same as Android), then Netflix-style float-up + reveal
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            guard let self = self else { return }
            UIView.animate(withDuration: 0.45,
                           delay: 0,
                           options: [.curveEaseIn],
                           animations: {
                self.tile.transform = self.tile.transform.translatedBy(x: 0, y: -64)
                self.label.transform = self.label.transform.translatedBy(x: 0, y: -64)
                self.tile.alpha = 0
                self.label.alpha = 0
                self.ring.alpha = 0
            }) { _ in
                self.reveal()
            }
        }
    }

    func reveal() {
        guard let window = AppDelegate.shared.window else { return }
        let web = BrowserViewController()
        UIView.transition(with: window, duration: 0.35, options: [.transitionCrossDissolve]) {
            window.rootViewController = web
        }
    }
}

// MARK: - Browser (the site in a WebView with the native bridge)

final class BrowserViewController: UIViewController, WKUIDelegate {
    private var webView: WKWebView!

    override func loadView() {
        let cfg = WKWebViewConfiguration()
        cfg.userContentController.add(Bridge.shared, name: "DeymflixApp")
        // app-mode flag for the site JS (same as the Android UA trick)
        cfg.applicationNameForUserAgent = "DeymflixApp/1.0"
        webView = WKWebView(frame: .zero, configuration: cfg)
        webView.uiDelegate = self
        webView.navigationDelegate = Bridge.shared
        webView.allowsBackForwardNavigationGestures = true
        view = webView
        Bridge.shared.webView = webView
        Bridge.shared.browser = self
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        if let url = URL(string: "https://deymflix.eu.cc/index.html") {
            webView.load(URLRequest(url: url))
        }
    }
}

// MARK: - The bridge (mirror of the Android DeymflixApp interface)

final class Bridge: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
    static let shared = Bridge()
    weak var webView: WKWebView?
    weak var browser: BrowserViewController?

    func userContentController(_ userContentController: WKUserContentController,
                               didReceive message: WKScriptMessage) {
        guard message.name == "DeymflixApp",
              let body = message.body as? [String: Any],
              let action = body["action"] as? String else { return }
        DispatchQueue.main.async { [weak self] in
            switch action {
            case "requestDownload":
                Downloader.shared.start(url: body["url"] as? String ?? "",
                                        title: body["title"] as? String ?? "Video",
                                        poster: body["poster"] as? String ?? "")
            case "openDownloads":
                self?.openDownloads()
            case "toggleFullscreen":
                let enter = (body["enter"] as? Bool) ?? false
                if enter { self?.openPlayer(url: body["url"] as? String, title: body["title"] as? String) }
            case "setSecure":
                break // iOS screenshots are app-controlled; no FLAG_SECURE equivalent needed
            case "playOnline":
                self?.openPlayer(url: body["url"] as? String, title: body["title"] as? String)
            default:
                break
            }
        }
    }

    // Inject the same handoff hook the Android app injects.
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        let js = """
        (function(){
        if(window.__dfxIosHook)return;window.__dfxIosHook=true;
        // expose the postMessage bridge under the same name the site knows
        window.DeymflixApp={};
        var send=function(o){window.webkit.messageHandlers.DeymflixApp.postMessage(o);};
        ['requestDownload','openDownloads','toggleFullscreen','setSecure','playOnline'].forEach(function(name){
          DeymflixApp[name]=function(){var a=[].slice.call(arguments);
            var o={action:name};if(name==='toggleFullscreen'){o.enter=a[0];o.isVideo=a[1];o.url=a[2]||'';o.title=a[3]||'';}
            else if(name==='requestDownload'){o.url=a[0];o.title=a[1];o.quality=a[2];o.poster=a[3];}
            else if(name==='playOnline'){o.url=a[0];o.title=a[1];}
            else if(name==='setSecure'){o.on=a[0];}
            send(o);};
        });
        document.addEventListener('fullscreenchange',function(){
          var v=document.querySelector('.video-container video')||document.querySelector('video');
          var u='';
          try{u=(v&&v.currentSrc&&!v.currentSrc.startsWith('blob:'))?v.currentSrc:(window.__dfxHlsUrl||'');}catch(e){}
          if(!u&&window.__dfxCurrentMovie){try{u=window.__dfxCurrentMovie._episodeHlsUrl||window.__dfxCurrentMovie._hlsUrl||'';}catch(e2){}}
          send({action:'toggleFullscreen',enter:!!document.fullscreenElement,isVideo:true,url:u,title:((window.__dfxCurrentMovie||{}).title||'')});
        },true);
        })()
        """
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    private func openDownloads() {
        let vc = DownloadsViewController()
        vc.modalPresentationStyle = .fullScreen
        browser?.present(vc, animated: true)
    }

    private func openPlayer(url: String?, title: String?) {
        guard let u = url, !u.isEmpty, u.hasPrefix("http") else { return }
        let vc = PlayerViewController()
        vc.streamURL = URL(string: u)
        vc.movieTitle = title ?? "DEYMFLIX"
        browser?.present(vc, animated: true)
    }
}

// MARK: - Hexagon icon drawn in code (favicon.svg geometry)

final class HexIconView: UIView {
    override init(frame: CGRect) { super.init(frame: frame); backgroundColor = .clear; isOpaque = false }
    required init?(coder: NSCoder) { fatalError() }
    override func draw(_ rect: CGRect) {
        guard let ctx = UIGraphicsGetCurrentContext() else { return }
        let s = min(bounds.width, bounds.height) / 64
        ctx.translateBy(x: bounds.midX - 32 * s, y: bounds.midY - 32 * s)
        ctx.scaleBy(x: s, y: s)
        // tile hexagon: dark fill + red stroke
        let hex = UIBezierPath()
        hex.move(to: CGPoint(x: 32, y: 6)); hex.addLine(to: CGPoint(x: 56, y: 18))
        hex.addLine(to: CGPoint(x: 56, y: 46)); hex.addLine(to: CGPoint(x: 32, y: 58))
        hex.addLine(to: CGPoint(x: 8, y: 46)); hex.addLine(to: CGPoint(x: 8, y: 18))
        hex.close()
        UIColor(red: 0.102, green: 0.102, blue: 0.102, alpha: 1).setFill()
        hex.fill()
        UIColor(red: 1.0, green: 0.118, blue: 0.153, alpha: 1).setStroke()
        hex.lineWidth = 3; hex.stroke()
        // red arrow
        let red = UIBezierPath()
        red.move(to: CGPoint(x: 25, y: 20)); red.addLine(to: CGPoint(x: 46, y: 32))
        red.addLine(to: CGPoint(x: 25, y: 44)); red.close()
        red.fill()
        // white arrow
        let wht = UIBezierPath()
        wht.move(to: CGPoint(x: 30, y: 24)); wht.addLine(to: CGPoint(x: 49, y: 32))
        wht.addLine(to: CGPoint(x: 30, y: 40)); wht.close()
        UIColor.white.withAlphaComponent(0.9).setFill()
        wht.fill()
    }
}
