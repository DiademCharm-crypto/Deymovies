import UIKit

// Offline downloads: URLSession writes to the app's Documents/Deymflix folder
// (the iOS equivalent of Android/data/.../Movies/Deymflix). Shown in
// DownloadsViewController with progress; playable through PlayerViewController.

final class Downloader: NSObject, URLSessionDownloadDelegate {
    static let shared = Downloader()
    lazy var session: URLSession = {
        let cfg = URLSessionConfiguration.background(withIdentifier: "eu.cc.deymflix.dl")
        cfg.isDiscretionary = false
        return URLSession(configuration: cfg, delegate: self, delegateQueue: .main)
    }()

    // metadata persisted so titles survive app restarts
    private static let metaKey = "dfx_dl_meta"
    private static var meta: [String: [String: String]] = {
        UserDefaults.standard.dictionary(forKey: metaKey) as? [String: [String: String]] ?? [:]
    }()

    struct Task {
        var url: URL
        var title: String
        var poster: String
        var localName: String { "dfx_" + Self.safeName(url.absoluteString) + ".mp4" }
        var localURL: URL { Self.dir().appendingPathComponent(localName) }
    }

    var tasks: [Task] = []
    var progress: [String: Double] = [:]   // key = url.absoluteString

    static func dir() -> URL {
        let d = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("Deymflix", isDirectory: true)
        try? FileManager.default.createDirectory(at: d, withIntermediateDirectories: true)
        return d
    }

    // filesystem-safe key for a url (no percent-encoding surprises)
    static func safeName(_ s: String) -> String {
        String(s.map { $0.isLetter || $0.isNumber ? $0 : "_" }).suffix(60).description
    }

    func start(url: String, title: String, poster: String) {
        guard let u = URL(string: url) else { return }
        // skip duplicates (same rule as Android: never re-download a movie)
        if Self.meta[u.absoluteString] != nil,
           FileManager.default.fileExists(atPath: Task(url: u, title: title, poster: poster).localURL.path) {
            NotificationCenter.default.post(name: .init("dfx-dl-toast"),
                                            object: "Already downloaded")
            return
        }
        let t = Task(url: u, title: title, poster: poster)
        tasks.append(t)
        Self.meta[u.absoluteString] = ["title": title, "poster": poster]
        UserDefaults.standard.set(Self.meta, forKey: Self.metaKey)
        session.downloadTask(with: u).resume()
    }

    static func titleFor(_ file: URL) -> String {
        // dfx_<safeurl>.mp4 -> look the url back up in the meta store
        let raw = file.lastPathComponent
            .replacingOccurrences(of: "dfx_", with: "")
            .replacingOccurrences(of: ".mp4", with: "")
        return meta.values.first { safeName(($0["title"] ?? "").lowercased()) == raw }?["title"]
            ?? meta.first { safeName($0.key) == raw }?.value["title"]
            ?? raw.replacingOccurrences(of: "_", with: " ")
    }

    static func list() -> [(title: String, file: URL)] {
        guard let items = try? FileManager.default.contentsOfDirectory(at: dir(), includingPropertiesForKeys: nil) else { return [] }
        return items
            .filter { $0.pathExtension == "mp4" }
            .sorted { $0.lastPathComponent > $1.lastPathComponent }
            .map { (title: titleFor($0), file: $0) }
    }

    static func remove(_ file: URL) {
        try? FileManager.default.removeItem(at: file)
    }

    // MARK: - URLSessionDownloadDelegate

    func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask,
                    didWriteData bytesWritten: Int64, totalBytesWritten: Int64,
                    totalBytesExpectedToWrite: Int64) {
        guard let u = downloadTask.originalRequest?.url?.absoluteString else { return }
        if totalBytesExpectedToWrite > 0 {
            progress[u] = Double(totalBytesWritten) / Double(totalBytesExpectedToWrite)
            NotificationCenter.default.post(name: .init("dfx-dl-progress"), object: nil)
        }
    }

    func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask,
                    didFinishDownloadingTo location: URL) {
        guard let u = downloadTask.originalRequest?.url else { return }
        let dest = Self.dir().appendingPathComponent(Task(url: u, title: "", poster: "").localName)
        try? FileManager.default.removeItem(at: dest)
        do {
            try FileManager.default.moveItem(at: location, to: dest)
        } catch {
            try? FileManager.default.copyItem(at: location, to: dest)
        }
        progress.removeValue(forKey: u.absoluteString)
        tasks.removeAll { $0.url == u }
        // sidecar subtitles, like Android: best-effort Engsub fetch
        if let title = Self.meta[u.absoluteString]?["title"] {
            let enc = title.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? title
            if let subURL = URL(string: "https://deymflix.eu.cc/subtitles/" + enc + "%20Engsub.srt") {
                let subDest = Self.dir().appendingPathComponent(dest.deletingPathExtension().lastPathComponent + ".srt")
                URLSession.shared.dataTask(with: subURL) { data, resp, _ in
                    if let d = data, let s = String(data: d, encoding: .utf8), s.contains("-->"),
                       (resp as? HTTPURLResponse)?.statusCode == 200 {
                        try? d.write(to: subDest)
                    }
                }.resume()
            }
        }
        NotificationCenter.default.post(name: .init("dfx-dl-toast"),
                                        object: "Downloaded: " + (Self.meta[u.absoluteString]?["title"] ?? "video"))
        NotificationCenter.default.post(name: .init("dfx-dl-progress"), object: nil)
    }
}
