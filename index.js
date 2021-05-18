/**
 * Import module
 */
require('dotenv').config()
const https = require('https')
const moment = require('moment')

/**
 * Import local
 */
const mailSender  = require('./mailSender');

const utils = {
  availableAppointmentCenter: [],
}
/**
 * Make a request on https://vitemadose.gitlab.io API
 * @param {number} department department number
 */
const getRequest = (department) => {

  https.get(`https://vitemadose.gitlab.io/vitemadose/${department}.json`, (resp) => {
    utils.availableAppointmentCenter = []
    let data = ''
    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      //console.log('data',JSON.parse(data));
      const VaccineSite = JSON.parse(data).centres_disponibles
      //console.log('VaccineSite',VaccineSite)

      for (const center of VaccineSite) {
        //console.log('center',center)
        const appointments = center.appointment_schedules
        for (const appointment of appointments) {
          if (appointment.name === 'chronodose') {
            //console.log('appointment', appointment)

            if (appointment.total > 0) {
              console.log('')
              const availableCenter = {
                "nom": center.nom,
                "url": center.url,
                "address": center.metadata.address,
                "city": center.location.city,
                "cp": center.location.cp,
                "vaccin": center.vaccine_type,
                "appointment": {
                  "name": "chronodose",
                  "from": moment(appointment.from).format("DD/MM/YYYY"),
                  "to": moment(appointment.to).format("DD/MM/YYYY"),
                  "total": appointment.total
                },
              }
              utils.availableAppointmentCenter.push(availableCenter)

            }
          }
        }
      }
      mailConstructor()
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });

}
/**
 * Build mail content and send it
 */
const mailConstructor = () => {
  if (utils.availableAppointmentCenter.length > 0) {
    let centerList = ``

    for (const center of utils.availableAppointmentCenter) {
      centerList = centerList + `
            <div>
                <h2>${center.nom}</h2>
                <a href=${center.url}>lien de prise de rdv</a>
                <div>
                    <h3>Adresse</h3>
                    <p>${center.address}</p>
                    <p>${center.city}</p>
                    <p>${center.cp}</p>
                </div>
                <div>${center.vaccin}</div>
                <div>
                    <h3>Rendez-vous</h3>
                    <p>${center.appointment.name}</p>
                    <p>${center.appointment.from}</p>
                    <p>${center.appointment.to}</p>     
                    <p>${center.appointment.total}</p>          
                </div>
            </div>
          `
    }

    const attachments = [
      {
        data: `
                        <html lang="fr"> 
                            <b style="font-size: large">Bonjour</b> 
                            <p>il y a ${utils.availableAppointmentCenter.length} rendez-vous disponible</p>
                            <div>${centerList}</div>
                        </html>`,
        alternative: true
      }
    ]
    mailSender(process.env.MAILTO, 'rendez-vous disponible', attachments)
  } else {
    const time = moment().format('DD MMMM YYYY, h:mm:ss a')
    console.log(`${time}: no appointment available`)
  }
}

getRequest(31) // single launch
//setInterval(function(){ getRequest(31); }, 600*1000)  // infinite loop 600*1000 = 10 min
