// Downloads screen: table of finished files + live progress rows, dark themed.

import UIKit

final class DownloadsViewController: UITableViewController {
    private var rows: [(title: String, file: URL)] = []

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "My Downloads"
        view.backgroundColor = UIColor(red: 0.043, green: 0.043, blue: 0.059, alpha: 1)
        tableView.separatorColor = UIColor(white: 1, alpha: 0.08)
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "cell")
        navigationItem.leftBarButtonItem = UIBarButtonItem(title: "Back", style: .plain,
                                                           target: self, action: #selector(close))
        navigationItem.leftBarButtonItem?.tintColor = .white
        navigationController?.navigationBar.titleTextAttributes = [.foregroundColor: UIColor.white]
        navigationController?.navigationBar.barStyle = .black
        NotificationCenter.default.addObserver(forName: .init("dfx-dl-progress"), object: nil, queue: .main) { [weak self] _ in
            self?.reload()
        }
        NotificationCenter.default.addObserver(forName: .init("dfx-dl-toast"), object: nil, queue: .main) { [weak self] n in
            if let msg = n.object as? String { self?.toast(msg) }
        }
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        reload()
    }

    private func reload() {
        rows = Downloader.list()
        tableView.reloadData()
    }

    @objc private func close() { dismiss(animated: true) }

    private func toast(_ text: String) {
        let l = UILabel()
        l.text = text
        l.textColor = .white
        l.font = .systemFont(ofSize: 14, weight: .semibold)
        l.textAlignment = .center
        l.backgroundColor = UIColor(white: 0, alpha: 0.75)
        l.layer.cornerRadius = 14
        l.clipsToBounds = true
        l.frame = CGRect(x: 0, y: 0, width: 300, height: 42)
        l.center = CGPoint(x: view.bounds.midX, y: view.bounds.maxY - 80)
        l.autoresizingMask = [.flexibleLeftMargin, .flexibleRightMargin, .flexibleTopMargin]
        view.addSubview(l)
        UIView.animate(withDuration: 0.3, delay: 1.8, options: []) { l.alpha = 0 } completion: { _ in l.removeFromSuperview() }
    }

    private var activeTasks: [Downloader.Task] { Downloader.shared.tasks }

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        max(rows.count + activeTasks.count, 1)
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let c = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath)
        var cfg = c.defaultContentConfiguration()
        let empty = rows.isEmpty && activeTasks.isEmpty
        if empty {
            cfg.text = "Nothing downloaded yet."
            cfg.textProperties.color = .lightGray
        } else if indexPath.row < rows.count {
            cfg.text = rows[indexPath.row].title
            cfg.textProperties.color = .white
            let srt = rows[indexPath.row].file.deletingPathExtension().appendingPathExtension("srt")
            cfg.secondaryText = FileManager.default.fileExists(atPath: srt.path) ? "Downloaded · Subtitle ready" : "Downloaded"
            cfg.secondaryTextProperties.color = .lightGray
            cfg.image = UIImage(systemName: "play.rectangle.fill")
            cfg.imageProperties.tintColor = UIColor(red: 0.898, green: 0.035, blue: 0.153, alpha: 1)
        } else {
            let t = activeTasks[indexPath.row - rows.count]
            let pct = Downloader.shared.progress[t.url.absoluteString] ?? 0
            cfg.text = t.title
            cfg.secondaryText = "Downloading… " + String(Int(pct * 100)) + "%"
            cfg.secondaryTextProperties.color = .lightGray
            cfg.image = UIImage(systemName: "arrow.down.circle")
            cfg.imageProperties.tintColor = .lightGray
        }
        c.contentConfiguration = cfg
        c.backgroundColor = .clear
        return c
    }

    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        guard indexPath.row < rows.count else { return }
        let vc = PlayerViewController()
        vc.movieTitle = rows[indexPath.row].title
        vc.streamURL = rows[indexPath.row].file
        vc.modalPresentationStyle = .fullScreen
        present(vc, animated: true)
    }

    // swipe to delete
    override func tableView(_ tableView: UITableView,
                            commit editingStyle: UITableViewCell.EditingStyle,
                            forRowAt indexPath: IndexPath) {
        guard editingStyle == .delete, indexPath.row < rows.count else { return }
        Downloader.remove(rows[indexPath.row].file)
        reload()
    }
}
