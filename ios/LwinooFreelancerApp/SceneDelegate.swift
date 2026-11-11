import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import UIKit

class SceneDelegate: RCTDefaultReactNativeFactoryDelegate, UIWindowSceneDelegate {
  var window: UIWindow?
  var reactNativeFactory: RCTReactNativeFactory?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene else {
      return
    }

    dependencyProvider = RCTAppDependencyProvider()
    reactNativeFactory = RCTReactNativeFactory(delegate: self)
    window = UIWindow(windowScene: windowScene)
    
    #if DEBUG
    let devMenuConfiguration = RCTDevMenuConfiguration(
      devMenuEnabled: true,
      shakeGestureEnabled: true,
      keyboardShortcutsEnabled: true
    )
    reactNativeFactory?.devMenuConfiguration = devMenuConfiguration
    #endif
    
    reactNativeFactory?.startReactNative(
      withModuleName: "LwinooFreelancerApp",
      in: window,
      connectionOptions: connectionOptions
    )

    showLaunchScreenUntilReactDraws()
  }

  /// Keeps the launch screen visible until React has drawn its first screen. React's views are
  /// added above this one and stay transparent until they paint, so the hand-off from the launch
  /// screen to the JS splash has no blank frame.
  private func showLaunchScreenUntilReactDraws() {
    guard
      let rootView = window?.rootViewController?.view,
      let launch = UIStoryboard(name: "LaunchScreen", bundle: nil)
        .instantiateInitialViewController()?.view
    else {
      return
    }
    rootView.backgroundColor = UIColor(named: "SplashBackground")
    launch.frame = rootView.bounds
    launch.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    rootView.insertSubview(launch, at: 0)

    let started = Date()
    Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { timer in
      let reactDrew = rootView.subviews.contains { $0 !== launch && Self.hasContent($0) }
      if reactDrew || Date().timeIntervalSince(started) > 15 {
        timer.invalidate()
        // One more frame so the first React paint is on screen before the cover goes.
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { launch.removeFromSuperview() }
      }
    }
  }

  /// React mounts its components a few levels below the root; any leaf view means it has drawn.
  private static func hasContent(_ view: UIView, depth: Int = 0) -> Bool {
    if depth >= 2 && view.subviews.isEmpty && !view.isHidden && view.bounds.width > 0 {
      return true
    }
    return view.subviews.contains { hasContent($0, depth: depth + 1) }
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    RCTLinkingManager.scene(scene, openURLContexts: URLContexts)
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    RCTLinkingManager.scene(scene, continue: userActivity)
  }

  override func bundleURL() -> URL? {
    #if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}
