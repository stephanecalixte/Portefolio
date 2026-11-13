import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Contact.module.css";
import { sendContactMessage } from "../../api";
import { useForm } from "react-hook-form";

const EMAIL = "contact@calixte-stephane.fr";

function hasInvalidControlCharacters(value, allowLineBreaks = false) {
  return [...value].some((character) => {
    const code = character.codePointAt(0);
    if (code === 127 || code < 9 || (code > 13 && code < 32)) return true;
    return !allowLineBreaks && (code === 9 || code === 10 || code === 13);
  });
}

export default function Contact() {
  const [status, setStatus] = useState("");
  const [sendFailed, setSendFailed] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
    setStatus("");
    setSendFailed(false);
    try {
      const result = await sendContactMessage(data);
      setStatus(result.message);
      reset();
    } catch (error) {
      setStatus(error.message);
      setSendFailed(true);
    }
  };



  return (
    <main className={styles.page}>
      <div className={styles.gridBackground} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <section className={styles.contactSection} aria-labelledby="contact-title">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>
            <span className={styles.statusDot} aria-hidden="true" />
            DISPONIBLE POUR DE NOUVEAUX PROJETS
          </p>
          <h1 id="contact-title" className={styles.title}>
            Parlons de
            <span> votre projet.</span>
          </h1>
          <p className={styles.description}>
            Une idée, une collaboration ou simplement envie d’échanger autour du
            réseau, du développement et du cloud ? Écrivez-moi, je vous répondrai
            au plus vite.
          </p>

          <a className={styles.emailCard} href={`mailto:${EMAIL}`}>
            <span className={styles.contactIcon} aria-hidden="true">
              @
            </span>
            <span className={styles.emailDetails}>
              <span className={styles.detailLabel}>ÉCRIVEZ-MOI DIRECTEMENT</span>
              <span className={styles.emailAddress}>{EMAIL}</span>
            </span>
            <span className={styles.arrow} aria-hidden="true">
              ↗
            </span>
          </a>

          <div className={styles.responseNote}>
            <span aria-hidden="true">◷</span>
            <p>En général, je réponds sous 48 heures.</p>
          </div>
        </div>

        <div className={styles.formCard}>
          <div className={styles.formHeading}>
            <span className={styles.formIndex}>01 / CONTACT</span>
            <h2>Envoyez-moi un message</h2>
            <p>Les champs marqués d’un astérisque sont obligatoires.</p>
          </div>



          <form
            className={styles.form}
            onSubmit={handleSubmit(onSubmit)}
            aria-busy={isSubmitting}
            noValidate
          >
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="contact-name">Votre nom *</label>
                <input
                  autoComplete="name"
                  required
                  id="contact-name"
                  placeholder="Jean Dupont"
                  maxLength={120}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  {...register("name", {
                    required: "Veuillez saisir votre nom.",
                    maxLength: { value: 120, message: "Le nom ne peut pas dépasser 120 caractères." },
                    setValueAs: (value) => value.trim(),
                    validate: (value) =>
                      (value.length > 0 && !hasInvalidControlCharacters(value)) ||
                      "Le nom contient des caractères invalides.",
                  })}
                />
                {errors.name && <span className={styles.fieldError} id="contact-name-error">{errors.name.message}</span>}
              </div>
              <div className={styles.field}>
                <label htmlFor="contact-email">Votre e-mail *</label>
                <input
                  autoComplete="email"
                  required
                  id="contact-email"
                  placeholder="jean@exemple.fr"
                  maxLength={254}
                  type="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  {...register("email", {
                    required: "Veuillez saisir votre adresse e-mail.",
                    maxLength: { value: 254, message: "L’adresse e-mail est trop longue." },
                    setValueAs: (value) => value.trim(),
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Veuillez saisir une adresse e-mail valide.",
                    },
                  })}
                />
                {errors.email && <span className={styles.fieldError} id="contact-email-error">{errors.email.message}</span>}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="contact-subject">Sujet *</label>
              <input
                id="contact-subject"
                required
                placeholder="Comment puis-je vous aider ?"
                maxLength={200}
                aria-invalid={Boolean(errors.subject)}
                aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                {...register("subject", {
                  required: "Veuillez indiquer un sujet.",
                  maxLength: { value: 200, message: "Le sujet ne peut pas dépasser 200 caractères." },
                  setValueAs: (value) => value.trim(),
                  validate: (value) =>
                    (value.length > 0 && !hasInvalidControlCharacters(value)) ||
                    "Le sujet contient des caractères invalides.",
                })}
              />
              {errors.subject && <span className={styles.fieldError} id="contact-subject-error">{errors.subject.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="contact-message">Votre message *</label>
              <textarea
                id="contact-message"
                required
                placeholder="Parlez-moi de votre projet..."
                maxLength={10000}
                rows="5"
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                {...register("message", {
                  required: "Veuillez écrire votre message.",
                  maxLength: { value: 10000, message: "Le message ne peut pas dépasser 10 000 caractères." },
                  setValueAs: (value) => value.trim(),
                  validate: (value) =>
                    (value.length > 0 && !hasInvalidControlCharacters(value, true)) ||
                    "Le message contient des caractères invalides.",
                })}
              />
              {errors.message && <span className={styles.fieldError} id="contact-message-error">{errors.message.message}</span>}
            </div>

            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor="contact-honeypot">Laissez ce champ vide</label>
              <input
                id="contact-honeypot"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                {...register("_honey")}
              />
            </div>

            <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Envoi en cours…" : "Envoyer mon message"}
              <span aria-hidden="true">↗</span>
            </button>
            <p className={styles.formHint}>
              Vos informations servent uniquement à répondre à votre demande et sont
              conservées au maximum 12 mois. Aucun consentement distinct n’est demandé
              pour ce traitement.{" "}
              <Link to="/privacy">En savoir plus sur vos données personnelles</Link>.
            </p>
            <p
              className={`${styles.status} ${sendFailed ? styles.statusError : ""}`}
              aria-live="polite"
              role={sendFailed ? "alert" : "status"}
            >
              {status}
            </p>
          </form>




        </div>
      </section>

      <div className={styles.bottomLink}>
        <span>Vous souhaitez d’abord découvrir mon travail ?</span>
        <Link to="/projects">Voir mes projets <span aria-hidden="true">↗</span></Link>
      </div>
    </main>
  );
}
