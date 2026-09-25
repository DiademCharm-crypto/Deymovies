import AVKit
import UIKit

// Native online/offline player — the AVPlayer twin of Android's LocalPlayer85:
// landscape, controls hidden on tap, speed, subtitles (Engsub/PHsub), resume.

final class PlayerViewController: AVPlayerViewController {
    var streamURL: URL?
    var movieTitle = "DEYMFLIX"
    private static let rates: [Float] = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]

    override func viewDidLoad() {
        super.viewDidLoad()
        title = movieTitle
        requiresLinearPlayback = false
        if #available(iOS 16.0, *) { allowsVideoFrameAnalysis = false }

        // rotate to landscape like the Android player; user can rotate freely
        if let scene = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene }).first {
            scene.requestGeometryUpdate(.iOS(interfaceOrientations: .landscapeRight)) { _ in }
        }

        if let u = streamURL {
            player = AVPlayer(url: u)
            player?.play()
        }
        addControls()
        restorePosition()
        NotificationCenter.default.addObserver(forName: UIApplication.willTerminateNotification,
                                               object: nil, queue: .main) { [weak self] _ in
            self?.savePosition()
        }
        NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime,
                                               object: nil, queue: .main) { [weak self] _ in
            self?.savePosition()
        }
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        savePosition()
        subTimer?.invalidate()
    }

    private func posKey() -> String {
        "pos_" + movieTitle.lowercased().replacingOccurrences(of: " ", with: "_")
    }
    private func restorePosition() {
        let t = UserDefaults.standard.double(forKey: posKey())
        if t > 0 { player?.seek(to: CMTime(seconds: t, preferredTimescale: 600)) }
    }
    private func savePosition() {
        guard let p = player, let cur = p.currentItem?.currentTime() else { return }
        guard cur.seconds.isFinite, cur.seconds > 0 else { return }
        UserDefaults.standard.set(cur.seconds, forKey: posKey())
    }

    // MARK: - Speed + CC buttons overlaid on the player controls

    private weak var speedBtn: UIButton?

    private func addControls() {
        guard let overlay = contentOverlayView else { return }

        let speed = UIButton(type: .system)
        speed.setTitle("1x", for: .normal)
        speed.setTitleColor(.white, for: .normal)
        speed.backgroundColor = UIColor(white: 0, alpha: 0.55)
        speed.layer.cornerRadius = 12
        speed.frame = CGRect(x: 16, y: 16, width: 52, height: 32)
        speed.autoresizingMask = [.flexibleRightMargin, .flexibleBottomMargin]
        speed.menu = UIMenu(children: PlayerViewController.rates.map { r in
            UIAction(title: String(r) + "x") { [weak self] _ in
                self?.player?.rate = r
                speed.setTitle(String(r) + "x", for: .normal)
            }
        })
        speed.showsMenuAsPrimaryAction = true
        overlay.addSubview(speed)
        speedBtn = speed

        let cc = UIButton(type: .system)
        cc.setTitle("CC", for: .normal)
        cc.setTitleColor(.white, for: .normal)
        cc.backgroundColor = UIColor(white: 0, alpha: 0.55)
        cc.layer.cornerRadius = 12
        cc.frame = CGRect(x: 76, y: 16, width: 52, height: 32)
        cc.autoresizingMask = [.flexibleRightMargin, .flexibleBottomMargin]
        cc.showsMenuAsPrimaryAction = true
        overlay.addSubview(cc)

        // CC menu fetches BOTH site sidecars; tapping one renders it.
        let base = "https://deymflix.eu.cc/subtitles/"
        let enc = movieTitle.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? movieTitle
        func subAction(_ name: String, _ suffix: String) -> UIAction {
            UIAction(title: name) { [weak self] _ in
                guard let url = URL(string: base + enc + suffix) else { return }
                self?.fetchAndRenderSubs(url)
            }
        }
        let off = UIAction(title: "Off") { [weak self] _ in
            self?.subLabel?.isHidden = true
            self?.cues = []
        }
        cc.menu = UIMenu(children: [off, subAction("English (Engsub)", "%20Engsub.srt"),
                                    subAction("Tagalog (PHsub)", "%20PHsub.srt")])
    }

    // MARK: - Subtitles: SRT fetched from the site, rendered natively

    private var subLabel: UILabel?
    private var subTimer: Timer?
    private var cues: [(Double, Double, String)] = []

    private func fetchAndRenderSubs(_ remote: URL) {
        URLSession.shared.dataTask(with: remote) { [weak self] data, _, _ in
            guard let self = self,
                  let data = data,
                  let srt = String(data: data, encoding: .utf8),
                  srt.contains("-->") else {
                DispatchQueue.main.async { self?.toast("No subtitle found for this title") }
                return
            }
            DispatchQueue.main.async { self.showManualSubs(srt: srt) }
        }.resume()
    }

    private func toast(_ text: String) {
        let l = UILabel()
        l.text = text
        l.textColor = .white
        l.font = .systemFont(ofSize: 14, weight: .semibold)
        l.textAlignment = .center
        l.backgroundColor = UIColor(white: 0, alpha: 0.7)
        l.layer.cornerRadius = 14
        l.clipsToBounds = true
        l.frame = CGRect(x: 0, y: 0, width: 320, height: 44)
        l.center = CGPoint(x: view.bounds.midX, y: view.bounds.maxY - 90)
        l.autoresizingMask = [.flexibleLeftMargin, .flexibleRightMargin, .flexibleTopMargin]
        view.addSubview(l)
        UIView.animate(withDuration: 0.3, delay: 1.6, options: []) {
            l.alpha = 0
        } completion: { _ in l.removeFromSuperview() }
    }

    private func showManualSubs(srt: String) {
        subLabel?.removeFromSuperview()
        subLabel = UILabel()
        subLabel?.numberOfLines = 0
        subLabel?.textAlignment = .center
        subLabel?.textColor = .white
        subLabel?.font = .systemFont(ofSize: 16, weight: .medium)
        subLabel?.layer.shadowColor = UIColor.black.cgColor
        subLabel?.layer.shadowRadius = 3
        subLabel?.layer.shadowOpacity = 1
        subLabel?.frame = CGRect(x: 20, y: 0, width: view.bounds.width - 40, height: 90)
        subLabel?.autoresizingMask = [.flexibleWidth, .flexibleTopMargin]
        subLabel?.center = CGPoint(x: view.bounds.midX, y: view.bounds.maxY - 110)
        view.addSubview(subLabel!)
        cues = parseSRT(srt)
        subTimer?.invalidate()
        subTimer = Timer.scheduledTimer(withTimeInterval: 0.25, repeats: true) { [weak self] _ in
            guard let self = self, let p = self.player else { return }
            let t = p.currentTime().seconds
            let line = self.cues.first { $0.0 <= t && t <= $0.1 }?.2 ?? ""
            self.subLabel?.text = line
            self.subLabel?.isHidden = line.isEmpty
        }
        toast("Subtitles on")
    }

    private func parseSRT(_ srt: String) -> [(Double, Double, String)] {
        var out: [(Double, Double, String)] = []
        func secs(_ s: String) -> Double {
            let p = s.replacingOccurrences(of: ",", with: ".").split(separator: ":").map { Double($0) ?? 0 }
            return p.count == 3 ? p[0]*3600 + p[1]*60 + p[2] : (p.count == 2 ? p[0]*60 + p[1] : (p.count == 1 ? p[0] : 0))
        }
        for block in srt.replacingOccurrences(of: "\r", with: "").components(separatedBy: "\n\n") {
            let lines = block.components(separatedBy: "\n").filter { !$0.isEmpty }
            guard lines.count >= 2 else { continue }
            let parts = lines[1].components(separatedBy: "-->")
            guard parts.count == 2 else { continue }
            let text = lines.count > 2 ? lines[2...].joined(separator: "\n") : ""
            out.append((secs(String(parts[0].trimmingCharacters(in: .whitespaces))),
                        secs(String(parts[1].trimmingCharacters(in: .whitespaces))),
                        text))
        }
        return out
    }

    override var supportedInterfaceOrientations: UIInterfaceOrientationMask { .landscape }
    override var prefersHomeIndicatorAutoHidden: Bool { true }
    override var prefersStatusBarHidden: Bool { true }
}
