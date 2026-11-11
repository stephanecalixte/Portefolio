import styles from './ProcessPage.module.css'

const PHASES = [
  {
    id: 'cadrage-conception',
    eyebrow: 'Phase 1',
    title: 'Comprendre et concevoir',
    description:
      'Transformer le besoin du client en une solution compréhensible, accessible, sécurisée et documentée.',
    color: '#7C3AED',
    steps: [
      {
        id: 'echanger-client',
        title: 'Échanger avec le client',
        subtitle: 'Contexte, utilisateurs et objectifs',
        icon: '💬',
        what:
          'Écouter le client et les utilisateurs, poser les bonnes questions et adapter sa communication à chaque interlocuteur, notamment aux personnes en situation de handicap.',
        input: 'Demande initiale et contexte métier',
        output: 'Objectifs, parties prenantes et besoins clarifiés',
        questions: [
          'Qui utilisera l’application et dans quel contexte ?',
          'Quelles difficultés ou situations de handicap prendre en compte ?',
          'Quels sont les objectifs et les contraintes du projet ?',
        ],
        tools: ['Entretiens', 'Ateliers', 'Compte rendu'],
        example:
          'Un atelier avec le client et les utilisateurs permet de préciser les besoins avant de choisir une solution.',
      },
      {
        id: 'analyser-besoins',
        title: 'Analyser le cahier des charges',
        subtitle: 'Fonctionnalités et contraintes',
        icon: '🔎',
        what:
          'Identifier les fonctionnalités à créer ou à faire évoluer, les règles métier, les contraintes techniques et les exigences de sécurité.',
        input: 'Cahier des charges, échanges et documents existants',
        output: 'Exigences fonctionnelles et non fonctionnelles priorisées',
        questions: [
          'Quelles fonctionnalités sont indispensables ?',
          'Quels critères permettent de valider chaque besoin ?',
          'Quelles contraintes de sécurité, de délai et de compatibilité ?',
        ],
        tools: ['User stories', 'Critères d’acceptation', 'Backlog'],
        example:
          '« Un utilisateur peut réinitialiser son mot de passe » devient une fonctionnalité avec des critères de validation vérifiables.',
      },
      {
        id: 'cas-utilisation',
        title: 'Décrire les parcours',
        subtitle: 'Cas d’utilisation et règles métier',
        icon: '🎯',
        what:
          'Décrire les acteurs, les actions possibles et les échanges entre l’utilisateur et le système, sans imposer prématurément une interface ou une technologie.',
        input: 'Besoins validés et règles métier',
        output: 'Parcours utilisateur et cas d’utilisation traçables',
        questions: [
          'Qui réalise chaque action ?',
          'Quels sont les scénarios normaux et les cas d’erreur ?',
          'Quelles actions dépendent d’autres actions ?',
        ],
        tools: ['UML', 'Diagrammes', 'User stories'],
        example:
          'Pour « Se connecter », décrire la saisie des identifiants, le succès, l’échec et la récupération du compte.',
      },
      {
        id: 'maquettes-accessibles',
        title: 'Maquetter les interfaces',
        subtitle: 'UX, RGAA et parcours inclusifs',
        icon: '🎨',
        what:
          'Concevoir les écrans et leur enchaînement en tenant compte du référentiel général d’amélioration de l’accessibilité (RGAA), des différents appareils et des technologies d’assistance.',
        input: 'Parcours utilisateur et identité visuelle',
        output: 'Maquettes, états d’écran et parcours accessibles',
        questions: [
          'Les contenus restent-ils compréhensibles au clavier et avec un lecteur d’écran ?',
          'Les états de chargement, de succès et d’erreur sont-ils prévus ?',
          'Les contrastes, libellés et mises en page sont-ils adaptés ?',
        ],
        tools: ['Figma', 'Penpot', 'Revue d’accessibilité'],
        example:
          'Un formulaire présente des libellés explicites, des erreurs annoncées et un parcours réalisable au clavier.',
      },
      {
        id: 'architecture',
        title: 'Définir l’architecture',
        subtitle: 'Couches logicielles et dossier de conception',
        icon: '🏗️',
        what:
          'Choisir une architecture adaptée, organisée en couches et intégrant la sécurité dès la conception, en s’appuyant sur les recommandations de l’ANSSI.',
        input: 'Exigences, maquettes et contraintes du projet',
        output: 'Architecture cible, décisions techniques et dossier de conception',
        questions: [
          'Quelles responsabilités appartiennent à chaque couche ?',
          'Comment protéger les données et contrôler les accès ?',
          'Quelles décisions doivent être documentées pour l’équipe ?',
        ],
        tools: ['Diagrammes d’architecture', 'ADR', 'Documentation technique'],
        example:
          'Séparer l’interface, la logique métier et l’accès aux données afin de limiter les dépendances et faciliter les contrôles de sécurité.',
      },
      {
        id: 'modele-donnees',
        title: 'Concevoir les données',
        subtitle: 'Modèles conceptuel, logique et physique',
        icon: '🗄️',
        what:
          'Modéliser les données puis préparer leur traduction en base relationnelle ou NoSQL. Définir les règles de conservation, de confidentialité et de mise à jour.',
        input: 'Règles métier et besoins de l’application',
        output: 'Modèle de données, schéma et contraintes',
        questions: [
          'Quelles entités, relations et règles d’intégrité ?',
          'Quel type de stockage répond au besoin ?',
          'Quelles données sont sensibles et qui peut y accéder ?',
        ],
        tools: ['MERISE', 'SQL', 'MySQL Workbench', 'Diagrammes'],
        example:
          'Définir les tables, les clés et les contraintes avant de créer ou modifier la base de données.',
      },
    ],
  },
  {
    id: 'developpement',
    eyebrow: 'Phase 2',
    title: 'Développer l’application sécurisée',
    description:
      'Mettre en œuvre les interfaces, les traitements métier et les accès aux données avec un environnement adapté au projet.',
    color: '#00B4D8',
    steps: [
      {
        id: 'environnement-projet',
        title: 'Préparer le travail',
        subtitle: 'Environnement et organisation du projet',
        icon: '🧰',
        what:
          'Installer et configurer l’environnement en fonction du projet, puis organiser le travail et les échanges avec les collaborateurs.',
        input: 'Architecture retenue et pratiques de l’équipe',
        output: 'Environnement reproductible et tâches organisées',
        questions: [
          'Quelles versions et dépendances le projet utilise-t-il ?',
          'Comment partager les changements et suivre les tâches ?',
          'Quels contrôles lancer avant chaque intégration ?',
        ],
        tools: ['Git', 'IDE', 'Gestionnaire de paquets', 'CI'],
        example:
          'Documenter les prérequis et vérifier qu’un autre membre de l’équipe peut lancer le projet.',
      },
      {
        id: 'interfaces-utilisateur',
        title: 'Développer les interfaces',
        subtitle: 'Composants UI et accessibilité',
        icon: '🖥️',
        what:
          'Transformer les maquettes en interfaces utilisables, responsive et accessibles, avec des composants réutilisables et sécurisés.',
        input: 'Maquettes validées et exigences d’accessibilité',
        output: 'Écrans fonctionnels et parcours utilisateur',
        questions: [
          'L’interface est-elle utilisable au clavier et sur mobile ?',
          'Les données saisies sont-elles validées et présentées clairement ?',
          'Les erreurs et retours d’action sont-ils accessibles ?',
        ],
        tools: ['HTML', 'CSS', 'JavaScript', 'Framework UI'],
        example:
          'Construire un formulaire responsive avec des libellés associés, des validations et des messages d’erreur explicites.',
      },
      {
        id: 'composants-metier',
        title: 'Développer les composants métier',
        subtitle: 'Règles et traitements applicatifs',
        icon: '⚙️',
        what:
          'Implémenter les traitements qui appliquent les règles métier et faire respecter les contrôles nécessaires à chaque opération.',
        input: 'Règles métier et contrats des fonctionnalités',
        output: 'Composants métier testables et sécurisés',
        questions: [
          'Les règles sont-elles appliquées côté serveur lorsque nécessaire ?',
          'Les entrées et permissions sont-elles vérifiées ?',
          'Les erreurs sont-elles traitées sans exposer de données sensibles ?',
        ],
        tools: ['Services métier', 'API', 'Tests unitaires'],
        example:
          'Vérifier côté serveur les droits d’un utilisateur avant de modifier une ressource.',
      },
      {
        id: 'acces-donnees',
        title: 'Développer l’accès aux données',
        subtitle: 'SQL, NoSQL et confidentialité',
        icon: '🔐',
        what:
          'Créer les accès et mises à jour des données, en protégeant leur intégrité, leur sécurité et leur confidentialité.',
        input: 'Modèle de données et règles d’autorisation',
        output: 'Accès aux données contrôlés et maintenables',
        questions: [
          'Les requêtes et mises à jour respectent-elles les permissions ?',
          'Les entrées sont-elles traitées de façon sûre ?',
          'Les données inutiles sont-elles évitées dans les réponses et journaux ?',
        ],
        tools: ['SQL', 'Pilotes de base de données', 'Migrations', 'Tests'],
        example:
          'Utiliser des requêtes paramétrées et limiter les résultats aux données autorisées pour l’utilisateur.',
      },
    ],
  },
  {
    id: 'validation-deploiement',
    eyebrow: 'Phase 3',
    title: 'Tester, déployer et améliorer',
    description:
      'Vérifier le résultat, préparer sa mise en production avec les équipes concernées, puis maintenir l’application dans la durée.',
    color: '#06D6A0',
    steps: [
      {
        id: 'plans-tests',
        title: 'Préparer et exécuter les tests',
        subtitle: 'Vérification fonctionnelle et technique',
        icon: '🧪',
        what:
          'Rédiger un plan de tests, préparer les données nécessaires et vérifier les exigences fonctionnelles, de sécurité et d’accessibilité.',
        input: 'Exigences, critères d’acceptation et version à tester',
        output: 'Résultats documentés, anomalies et décision de validation',
        questions: [
          'Quels scénarios couvrent les exigences et les cas limites ?',
          'Quels tests sont automatisés et lesquels nécessitent une vérification manuelle ?',
          'Les défauts sont-ils reproductibles et tracés ?',
        ],
        tools: ['Tests unitaires', 'Tests d’intégration', 'Recette', 'CI'],
        example:
          'Exécuter le scénario nominal et les cas d’échec de connexion, puis consigner le résultat.',
      },
      {
        id: 'preparer-deploiement',
        title: 'Préparer le déploiement',
        subtitle: 'Procédures, configuration et retour arrière',
        icon: '📦',
        what:
          'Documenter les étapes de déploiement, la configuration, les dépendances, les contrôles après installation et la marche à suivre en cas d’échec.',
        input: 'Version testée et environnement cible',
        output: 'Procédure de déploiement et consignes d’exploitation',
        questions: [
          'Quels paramètres doivent être fournis par l’environnement ?',
          'Comment confirmer que la mise en service a réussi ?',
          'Comment revenir à une version stable si nécessaire ?',
        ],
        tools: ['Documentation', 'Pipeline CI/CD', 'Scripts de déploiement'],
        example:
          'Fournir une procédure vérifiable avec les prérequis, étapes, contrôles et stratégie de retour arrière.',
      },
      {
        id: 'mise-production',
        title: 'Contribuer à la mise en production',
        subtitle: 'Démarche DevOps et équipe de production',
        icon: '🚀',
        what:
          'Collaborer avec l’équipe de production pour livrer l’application, suivre son état et partager les informations nécessaires à son exploitation.',
        input: 'Livrable validé, procédure et équipe d’exploitation',
        output: 'Mise en production suivie et transmission opérationnelle',
        questions: [
          'Qui valide et réalise chaque étape de la livraison ?',
          'Quels indicateurs et journaux permettent de suivre le service ?',
          'Comment communiquer un incident à l’équipe concernée ?',
        ],
        tools: ['CI/CD', 'Supervision', 'Journaux applicatifs'],
        example:
          'Après la livraison, contrôler les indicateurs essentiels et transmettre les consignes à l’exploitation.',
      },
      {
        id: 'rgpd-conformite',
        title: 'Prendre en compte le RGPD',
        subtitle: 'Données personnelles et mentions légales',
        icon: '🛡️',
        what:
          'Identifier les traitements de données personnelles et contribuer à leur protection ainsi qu’à la mise en place des mentions légales adaptées au projet.',
        input: 'Données collectées, finalités et règles de l’organisation',
        output: 'Traitements documentés et informations destinées aux utilisateurs',
        questions: [
          'Quelles données sont collectées et pourquoi ?',
          'Comment expliquer clairement leur utilisation aux utilisateurs ?',
          'Quelles règles internes encadrent leur accès et leur conservation ?',
        ],
        tools: ['Inventaire des traitements', 'Mentions légales', 'Référent compétent'],
        example:
          'Documenter les données demandées par un formulaire et afficher une information compréhensible au moment de leur collecte.',
      },
      {
        id: 'maintenance-veille',
        title: 'Résoudre et faire évoluer',
        subtitle: 'Incidents, maintenance et veille',
        icon: '🔄',
        what:
          'Adopter une démarche structurée pour diagnostiquer les dysfonctionnements, y compris en production, corriger leur cause et suivre les évolutions techniques et de sécurité.',
        input: 'Retours utilisateurs, alertes et évolutions technologiques',
        output: 'Corrections vérifiées et améliorations planifiées',
        questions: [
          'Comment reproduire et isoler la cause du problème ?',
          'Quel est l’impact pour les utilisateurs et le service ?',
          'Quelles mises à jour de sécurité ou évolutions faut-il évaluer ?',
        ],
        tools: ['Suivi d’incidents', 'Journaux', 'Veille technique'],
        example:
          'Qualifier un incident, protéger le service, corriger la cause, puis vérifier le correctif avant livraison.',
      },
    ],
  },
]

const STEPS = PHASES.flatMap((phase) =>
  phase.steps.map((step, index) => ({
    ...step,
    number: PHASES.slice(0, PHASES.indexOf(phase)).reduce(
      (total, previousPhase) => total + previousPhase.steps.length,
      index + 1,
    ),
    color: phase.color,
  })),
)

function StepCard({ step }) {
  return (
    <article
      className={styles.card}
      style={{ borderTop: `4px solid ${step.color}` }}
    >
      <header className={styles.cardHeader}>
        <span
          className={styles.cardIcon}
          style={{ background: step.color }}
          aria-hidden="true"
        >
          {step.icon}
        </span>
        <div>
          <h3 className={styles.cardTitle}>
            <span className={styles.cardNum}>{step.number}.</span> {step.title}
          </h3>
          <p className={styles.cardSubtitle}>{step.subtitle}</p>
        </div>
      </header>

      <p className={styles.cardWhat}>{step.what}</p>

      <dl className={styles.cardMeta}>
        <div><dt>Entrée</dt><dd>{step.input}</dd></div>
        <div><dt>Sortie</dt><dd>{step.output}</dd></div>
      </dl>

      <h4 className={styles.cardHeading}>Questions à se poser</h4>
      <ul className={styles.cardList}>
        {step.questions.map((question) => <li key={question}>{question}</li>)}
      </ul>

      <h4 className={styles.cardHeading}>Outils et supports</h4>
      <ul className={styles.cardTags}>
        {step.tools.map((tool) => (
          <li key={tool} className={styles.tag}>{tool}</li>
        ))}
      </ul>

      <p className={styles.cardExample}>
        <strong>Exemple :</strong> {step.example}
      </p>
    </article>
  )
}

function UseCaseMiniDiagram() {
  return (
    <figure className={styles.usecaseDiagram} aria-labelledby="usecase-caption">
      <div className={styles.usecaseActors}>
        <span className={styles.usecaseActor}>👤 Utilisateur</span>
      </div>
      <div className={styles.usecaseSystem}>
        <span className={styles.usecaseSystemLabel}>Exemple — Application de compte</span>
        <ul className={styles.usecaseList}>
          <li>🔐 S’authentifier</li>
          <li>👤 Consulter son profil</li>
        </ul>
        <p className={styles.usecaseInclude}>
          S’authentifier <em>&lt;&lt;include&gt;&gt;</em> Vérifier les identifiants
        </p>
      </div>
      <figcaption id="usecase-caption" className={styles.usecaseCaption}>
        Exemple de parcours à préciser avec le client avant de concevoir les écrans et les traitements.
      </figcaption>
    </figure>
  )
}

function PracticeSection() {
  return (
    <section className={styles.practice} aria-labelledby="practice-title">
      <h2 id="practice-title" className={styles.rulesTitle}>
        Des compétences transversales à chaque étape
      </h2>
      <div className={styles.practiceGrid}>
        <article className={styles.practiceCard}>
          <h3>Sécurité et qualité</h3>
          <p>
            Appliquer les recommandations de sécurité, protéger les accès et les données,
            et vérifier les choix techniques pendant tout le cycle de vie.
          </p>
        </article>
        <article className={styles.practiceCard}>
          <h3>Accessibilité et communication</h3>
          <p>
            Concevoir des interfaces et des parcours accessibles, et adapter les échanges
            aux utilisateurs, aux clients et aux situations de handicap.
          </p>
        </article>
        <article className={styles.practiceCard}>
          <h3>Collaboration et anglais</h3>
          <p>
            Travailler avec les clients et les équipes projet — conception, test, sécurité,
            données et exploitation. Communiquer en anglais au niveau B1 à l’écrit et en
            compréhension, et A2 à l’oral.
          </p>
        </article>
        <article className={styles.practiceCard}>
          <h3>Contextes professionnels</h3>
          <p>
            Mener un projet de petite taille en autonomie ou contribuer à une équipe
            hiérarchisée ou agile. Exercer en entreprise, en ESN ou comme indépendant,
            sur site ou à distance selon les missions.
          </p>
        </article>
      </div>
      <p className={styles.workNote}>
        Le métier implique un travail prolongé sur écran ; certaines missions peuvent
        inclure du télétravail ou des déplacements.
      </p>
    </section>
  )
}

export default function ProcessPage() {
  return (
    <main className={styles.process}>
      <header className={styles.intro}>
        <p className={styles.introEyebrow}>Concepteur développeur d’applications</p>
        <h1 className={styles.introTitle}>Du besoin à l’application en production</h1>
        <p className={styles.introText}>
          Un parcours complet, du dialogue avec le client à la maintenance :
          concevoir et développer des applications sécurisées, accessibles et testées,
          puis préparer leur mise en production.
        </p>
      </header>

      <nav className={styles.pipeline} aria-label="Étapes du processus">
        {STEPS.map((step) => (
          <div key={step.id} className={styles.pipelineItem}>
            <a href={`#${step.id}`} className={styles.pipelineStep}>
              <span
                className={styles.pipelineBadge}
                style={{ background: step.color }}
              >
                {step.number}
              </span>
              <span className={styles.pipelineLabel}>{step.title}</span>
            </a>
          </div>
        ))}
      </nav>

      <section aria-label="Exemple de parcours utilisateur">
        <UseCaseMiniDiagram />
      </section>

      {PHASES.map((phase) => {
        const phaseSteps = STEPS.filter((step) =>
          phase.steps.some((phaseStep) => phaseStep.id === step.id),
        )

        return (
          <section
            key={phase.id}
            className={styles.phase}
            aria-labelledby={`${phase.id}-title`}
          >
            <header className={styles.phaseHeader}>
              <p className={styles.phaseEyebrow} style={{ color: phase.color }}>
                {phase.eyebrow}
              </p>
              <h2 id={`${phase.id}-title`} className={styles.phaseTitle}>
                {phase.title}
              </h2>
              <p className={styles.phaseText}>{phase.description}</p>
            </header>
            <div className={styles.grid}>
              {phaseSteps.map((step) => (
                <div key={step.id} id={step.id} className={styles.stepAnchor}>
                  <StepCard step={step} />
                </div>
              ))}
            </div>
          </section>
        )
      })}

      <PracticeSection />

      <section className={styles.rules} aria-labelledby="rules-title">
        <h2 id="rules-title" className={styles.rulesTitle}>Repères de réalisation</h2>
        <ol className={styles.rulesList}>
          <li><strong>Partir du besoin :</strong> valider les objectifs avec le client et les utilisateurs.</li>
          <li><strong>Tracer les décisions :</strong> relier les besoins aux parcours, composants et tests.</li>
          <li><strong>Sécuriser dès la conception :</strong> intégrer la protection des données à chaque couche.</li>
          <li><strong>Vérifier avant livraison :</strong> tester les exigences, l’accessibilité et les cas d’erreur.</li>
          <li><strong>Préparer l’exploitation :</strong> documenter le déploiement et travailler avec la production.</li>
          <li><strong>Améliorer en continu :</strong> traiter les incidents et suivre la veille technique.</li>
        </ol>
      </section>
    </main>
  )
}
