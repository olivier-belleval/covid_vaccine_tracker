require('dotenv').config()
const Pushover = require( 'pushover-js').Pushover;

/**
 *
 * @param { string } title
 * @param { string } text
 * @param { string } url
 * @return {Promise<void>}
 */
const sendNotification = async ( title, text, url) => {

  const pushover = new Pushover(process.env.PUSHOVERUSER, process.env.PUSHOVERTOKEN)

  pushover.setUrl(url, 'url rdv')
  try {
    const response = await pushover.send(title, text)
    console.log(response)
  } catch (error) {
    console.error(error)
  }
}

module.exports = sendNotification;
