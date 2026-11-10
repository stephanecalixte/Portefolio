import { Link } from "react-router-dom";
import styles from "./Privacy.module.css";

const CONTACT_EMAIL = "stephanecalixte243@gmail.com";

export default function Privacy() {
  return (
    <main className={styles.page}>
      <div className={styles.gridBackground} aria-hidden="true" />
      <article className={styles.content}>
        <p className={styles.eyebrow}>INFORMATIONS LÉGALES</p>
        <h1>Confidentialité et données personnelles</h1>
        <p className={styles.updated}>Dernière mise à jour : 10 novembre 2026</p>

        <section>
          <h2>Responsable du traitement</h2>
          <p>
            Calixte Stéphane, personne physique actuellement en formation, est
            responsable du traitement des messages envoyés depuis ce portfolio.
            Pour toute question relative à vos données, contactez-le à{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </section>

        <section>
          <h2>Données collectées et finalité</h2>
          <p>
            Le formulaire demande votre nom, votre adresse e-mail, le sujet et le
            contenu de votre message. Ces informations servent uniquement à
            recevoir, traiter et répondre à votre demande. Elles ne sont ni
            utilisées pour de la prospection ni partagées à des fins commerciales.
          </p>
          <p>
            La base légale est l’intérêt légitime à répondre aux demandes reçues
            via le portfolio (article 6(1)(f) du RGPD). Si une demande concerne
            précisément la préparation d’un contrat, le traitement peut également
            être nécessaire à des mesures précontractuelles prises à votre
            demande (article 6(1)(b)).
          </p>
          <p>
            Les champs marqués comme obligatoires sont nécessaires pour pouvoir
            traiter le message. Aucun profilage ni décision automatisée n’est
            effectué.
          </p>
        </section>

        <section>
          <h2>Destinataires et hébergement</h2>
          <p>
            Les messages sont enregistrés dans la base MySQL configurée pour le
            portfolio et accessibles à son responsable. Pour la configuration
            actuelle, cette base fonctionne localement. Si l’application ou la
            base est hébergée par un prestataire, celui-ci pourra traiter les
            données pour le compte du responsable ; cette notice devra alors
            préciser le prestataire, le lieu d’hébergement et les garanties
            applicables.
          </p>
          <p>
            Le formulaire ne déclenche pas l’envoi d’un e-mail. Aucune adresse IP
            n’est enregistrée dans la base par le formulaire ; elle est utilisée
            temporairement par le serveur pour limiter les envois répétés.
          </p>
        </section>

        <section>
          <h2>Durée de conservation</h2>
          <p>
            Les messages sont supprimés au plus tard 12 mois après leur envoi.
            Le serveur lance un nettoyage à son démarrage puis toutes les 24
            heures. Si le serveur est arrêté à la date prévue, le nettoyage aura
            lieu à son prochain démarrage.
          </p>
        </section>

        <section>
          <h2>Vos droits</h2>
          <p>
            Dans les conditions prévues par le RGPD, vous pouvez demander l’accès,
            la rectification, l’effacement ou la limitation du traitement de vos
            données, et vous opposer au traitement fondé sur l’intérêt légitime.
            Pour exercer ces droits, écrivez à{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> en précisant
            votre demande. Une vérification raisonnable de votre identité pourra
            être demandée. Une réponse vous sera apportée dans le délai légal,
            généralement un mois.
          </p>
          <p>
            Vous pouvez également introduire une réclamation auprès de la CNIL,
            <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noreferrer">
              {" "}en ligne
            </a>
            .
          </p>
        </section>

        <p className={styles.backLink}>
          <Link to="/contact">Retour au formulaire de contact</Link>
        </p>
      </article>
    </main>
  );
}
