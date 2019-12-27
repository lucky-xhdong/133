/**
 * 浏览器消息通知
 * @param title
 * @param msg
 * @param icon
 * @returns {boolean}
 */
export function showMsgNotification(title, msg, icon) {
  const options = {
    body: msg,
    icon: icon
  }
  const Notification = window.Notification || window.mozNotification || window.webkitNotification
  if (Notification && Notification.permission === 'granted') {
    const instance = new Notification(title, options)
    instance.onclick = function() {
      // Something to do
    }
    instance.onerror = function() {
      // Something to do
    }
    instance.onshow = function() {
      // Something to do
      setTimeout(function() {
        instance.close()
      }, 3000)
    }
    instance.onclose = function() {
      // Something to do
    }
  } else if (Notification && Notification.permission !== 'denied') {
    Notification.requestPermission(function(status) {
      if (Notification.permission !== status) {
        Notification.permission = status
      }
      // If the user said okay
      if (status === 'granted') {
        const instance = new Notification(title, options)
        instance.onclick = function() {
          // Something to do
        }
        instance.onerror = function() {
          // Something to do
        }
        instance.onshow = function() {
          // Something to do
          setTimeout(instance.close, 3000)
        }
        instance.onclose = function() {
          // Something to do
        }
      } else {
        return false
      }
    })
  } else {
    return false
  }
}
