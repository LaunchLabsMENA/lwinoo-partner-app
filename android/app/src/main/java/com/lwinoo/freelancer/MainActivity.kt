package com.lwinoo.freelancer

import android.os.Bundle
import android.view.ViewGroup
import android.view.ViewTreeObserver
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.swmansion.rnscreens.fragment.restoration.RNScreensFragmentFactory

class MainActivity : ReactActivity() {

  // Required by react-native-screens so Android can restore screens after process death.
  override fun onCreate(savedInstanceState: Bundle?) {
    supportFragmentManager.fragmentFactory = RNScreensFragmentFactory()
    super.onCreate(savedInstanceState)
    keepLaunchScreenUntilReactDraws()
  }

  /**
   * The theme's window background is the launch screen. Once React has added its first view, swap
   * it for the plain app colour so it can't show through behind the keyboard or screen transitions.
   */
  private fun keepLaunchScreenUntilReactDraws() {
    val content = findViewById<ViewGroup>(android.R.id.content)
    content.viewTreeObserver.addOnPreDrawListener(
        object : ViewTreeObserver.OnPreDrawListener {
          override fun onPreDraw(): Boolean {
            val reactRoot = content.getChildAt(0) as? ViewGroup
            if (reactRoot != null && reactRoot.childCount > 0) {
              content.viewTreeObserver.removeOnPreDrawListener(this)
              window.setBackgroundDrawableResource(R.color.app_background)
            }
            return true
          }
        })
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "LwinooFreelancerApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
