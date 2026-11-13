import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./Admin.module.css";

const EMPTY_PROJECT = {
  title: "",
  category: "web",
  categoryLabel: "Web",
  year: new Date().getFullYear(),
  shortDesc: "",
  longDesc: "",
  tech: "",
  status: "En cours",
  color: "#7fd0ff",
  icon: "✦",
  features: "",
  sortOrder: 0,
  isPublished: false,
};

const EMPTY_SKILL = { categorySlug: "", name: "", level: 75, sortOrder: 0 };
const NAV_ITEMS = [
  { id: "overview", label: "Vue d’ensemble", icon: "⌂" },
  { id: "projects", label: "Projets", icon: "▦" },
  { id: "skills", label: "Compétences", icon: "◈" },
  { id: "messages", label: "Messages", icon: "✉" },
];

async function adminRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api/admin${path}`, {
      credentials: "same-origin",
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Impossible de joindre le serveur d’administration.", { cause: error });
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const result = response.status === 204
    ? null
    : isJson
      ? await response.json().catch(() => null)
      : null;

  if (!response.ok) {
    const message = result?.error || "La requête a échoué.";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  // Le fallback SPA du Worker renvoie index.html en 200 pour les routes API inconnues.
  if (result === null && response.status !== 204) {
    const error = new Error("Le backend d’administration n’est pas déployé sur ce Worker.");
    error.status = 404;
    throw error;
  }

  return result;
}

const listToText = (value) => Array.isArray(value) ? value.join("\n") : "";
const textToList = (value) => value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date inconnue"
    : new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function ProjectEditor({ project, onSave, onClose, busy }) {
  const [form, setForm] = useState(() => project
    ? { ...project, tech: listToText(project.tech), features: listToText(project.features) }
    : { ...EMPTY_PROJECT });
  const [error, setError] = useState("");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await onSave({
        ...form,
        year: Number(form.year),
        sortOrder: Number(form.sortOrder),
        tech: textToList(form.tech),
        features: textToList(form.features),
      });
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  return (
    <div className={styles.modalBackdrop} onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <form className={styles.editor} onSubmit={submit}>
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.eyebrow}>{project ? `PROJET #${project.id}` : "NOUVEAU PROJET"}</p>
            <h2>{project ? "Modifier le projet" : "Créer un projet"}</h2>
          </div>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Fermer">×</button>
        </div>
        <div className={styles.formGrid}>
          <label className={styles.wideField}>Titre
            <input required maxLength={180} value={form.title} onChange={(event) => update("title", event.target.value)} />
          </label>
          <label>Catégorie technique
            <input required maxLength={64} value={form.category} onChange={(event) => update("category", event.target.value)} />
          </label>
          <label>Libellé affiché
            <input required maxLength={100} value={form.categoryLabel} onChange={(event) => update("categoryLabel", event.target.value)} />
          </label>
          <label>Année
            <input required type="number" min="2000" max="2100" value={form.year} onChange={(event) => update("year", event.target.value)} />
          </label>
          <label>Statut
            <input required maxLength={40} value={form.status} onChange={(event) => update("status", event.target.value)} />
          </label>
          <label>Couleur
            <span className={styles.colorControl}>
              <input aria-label="Couleur du projet" type="color" value={form.color} onChange={(event) => update("color", event.target.value)} />
              <code>{form.color}</code>
            </span>
          </label>
          <label>Icône
            <input required maxLength={16} value={form.icon} onChange={(event) => update("icon", event.target.value)} />
          </label>
          <label>Ordre d’affichage
            <input required type="number" min="0" max="65535" value={form.sortOrder} onChange={(event) => update("sortOrder", event.target.value)} />
          </label>
          <label className={styles.wideField}>Description courte
            <textarea required rows="2" maxLength={500} value={form.shortDesc} onChange={(event) => update("shortDesc", event.target.value)} />
          </label>
          <label className={styles.wideField}>Description complète
            <textarea required rows="4" maxLength={20000} value={form.longDesc} onChange={(event) => update("longDesc", event.target.value)} />
          </label>
          <label>Technologies <span className={styles.fieldHint}>Une par ligne</span>
            <textarea rows="4" value={form.tech} onChange={(event) => update("tech", event.target.value)} />
          </label>
          <label>Fonctionnalités <span className={styles.fieldHint}>Une par ligne</span>
            <textarea rows="4" value={form.features} onChange={(event) => update("features", event.target.value)} />
          </label>
        </div>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" checked={form.isPublished} onChange={(event) => update("isPublished", event.target.checked)} />
          Publier ce projet sur le portfolio
        </label>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.modalActions}>
          <button type="button" className={styles.secondaryButton} onClick={onClose}>Annuler</button>
          <button type="submit" className={styles.primaryButton} disabled={busy}>
            {busy ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SkillEditor({ skill, categories, onSave, onClose, busy }) {
  const [form, setForm] = useState(() => skill ? { ...skill } : {
    ...EMPTY_SKILL,
    categorySlug: categories[0]?.slug || "",
  });
  const [error, setError] = useState("");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await onSave({ ...form, level: Number(form.level), sortOrder: Number(form.sortOrder) });
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  return (
    <div className={styles.modalBackdrop} onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <form className={`${styles.editor} ${styles.skillEditor}`} onSubmit={submit}>
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.eyebrow}>{skill ? "COMPÉTENCE" : "NOUVELLE COMPÉTENCE"}</p>
            <h2>{skill ? "Modifier" : "Ajouter"}</h2>
          </div>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Fermer">×</button>
        </div>
        <label>Catégorie
          <select required value={form.categorySlug} onChange={(event) => update("categorySlug", event.target.value)}>
            {categories.map((category) => <option key={category.slug} value={category.slug}>{category.category}</option>)}
          </select>
        </label>
        <label>Nom
          <input required maxLength={180} value={form.name} onChange={(event) => update("name", event.target.value)} />
        </label>
        <label>Niveau <strong>{form.level}%</strong>
          <input type="range" min="0" max="100" value={form.level} onChange={(event) => update("level", event.target.value)} />
        </label>
        <label>Ordre
          <input type="number" min="0" max="65535" value={form.sortOrder} onChange={(event) => update("sortOrder", event.target.value)} />
        </label>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.modalActions}>
          <button type="button" className={styles.secondaryButton} onClick={onClose}>Annuler</button>
          <button type="submit" className={styles.primaryButton} disabled={busy || categories.length === 0}>
            {busy ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Admin() {
  // /admin est déjà protégé par Basic Auth : aucune session React à vérifier.
  const username = "Admin";
  const [activeTab, setActiveTab] = useState("overview");
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [projectEditor, setProjectEditor] = useState(null);
  const [skillEditor, setSkillEditor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async (tab, signal) => {
    setLoading(true);
    setError("");
    try {
      if (tab === "overview" || tab === "projects") {
        const data = await adminRequest("/projects", { signal });
        setProjects(Array.isArray(data) ? data : []);
      }
      if (tab === "overview" || tab === "skills") {
        const data = await adminRequest("/skills", { signal });
        setCategories(Array.isArray(data) ? data : []);
      }
      if (tab === "overview" || tab === "messages") {
        const data = await adminRequest("/messages", { signal });
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (loadError) {
      if (loadError.name !== "AbortError") {
        setError(loadError.message);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => loadData(activeTab, controller.signal), 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [activeTab, loadData]);

  const counts = useMemo(() => ({
    projects: projects.length,
    published: projects.filter((project) => Boolean(project.isPublished)).length,
    skills: categories.reduce((total, category) => total + category.items.length, 0),
    messages: messages.length,
  }), [projects, categories, messages]);

  const filteredProjects = projects.filter((project) =>
    `${project.title} ${project.categoryLabel}`.toLowerCase().includes(search.toLowerCase()),
  );

  const logout = () => {
    // Basic Auth n’a pas de déconnexion applicative : on quitte simplement l’admin.
    window.location.assign("/");
  };

  const saveProject = async (form) => {
    setBusy(true);
    try {
      await adminRequest(projectEditor?.id ? `/projects/${projectEditor.id}` : "/projects", {
        method: projectEditor?.id ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      setProjectEditor(null);
      setNotice(projectEditor?.id ? "Projet mis à jour." : "Projet créé.");
      await loadData("projects");
    } finally {
      setBusy(false);
    }
  };

  const deleteProject = async (project) => {
    if (!window.confirm(`Supprimer « ${project.title} » ? Cette action est définitive.`)) return;
    setBusy(true);
    try {
      await adminRequest(`/projects/${project.id}`, { method: "DELETE" });
      setNotice("Projet supprimé.");
      await loadData("projects");
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(false);
    }
  };

  const saveSkill = async (form) => {
    setBusy(true);
    try {
      await adminRequest(skillEditor?.id ? `/skills/${skillEditor.id}` : "/skills", {
        method: skillEditor?.id ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      setSkillEditor(null);
      setNotice(skillEditor?.id ? "Compétence mise à jour." : "Compétence ajoutée.");
      await loadData("skills");
    } finally {
      setBusy(false);
    }
  };

  const deleteSkill = async (skill) => {
    if (!window.confirm(`Supprimer la compétence « ${skill.name} » ?`)) return;
    setBusy(true);
    try {
      await adminRequest(`/skills/${skill.id}`, { method: "DELETE" });
      setNotice("Compétence supprimée.");
      await loadData("skills");
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteMessage = async (message) => {
    if (!window.confirm(`Supprimer le message de ${message.name} ?`)) return;
    setBusy(true);
    try {
      await adminRequest(`/messages/${message.id}`, { method: "DELETE" });
      setSelectedMessage(null);
      setNotice("Message supprimé.");
      await loadData("messages");
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className={styles.adminPage}>
      <aside className={styles.sidebar}>
        <a className={styles.brand} href="/admin" aria-label="Administration, accueil">
          CS<span>.</span><small>STUDIO ADMIN</small>
        </a>
        <p className={styles.navCaption}>ESPACE DE TRAVAIL</p>
        <nav className={styles.adminNav} aria-label="Navigation admin">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ""}`}
              onClick={() => { setActiveTab(item.id); setError(""); setNotice(""); }}
            >
              <span aria-hidden="true">{item.icon}</span>{item.label}
              {item.id === "messages" && messages.length > 0 && <small>{messages.length}</small>}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <a className={styles.viewSite} href="/" target="_blank" rel="noreferrer">↗ <span>Voir le portfolio</span></a>
          <div className={styles.userCard}>
            <span className={styles.avatar}>{username.slice(0, 1).toUpperCase()}</span>
            <span className={styles.userInfo}><strong>{username}</strong><small>Administrateur</small></span>
            <button type="button" onClick={logout} disabled={busy} aria-label="Quitter l’administration" title="Quitter l’administration">↗</button>
          </div>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}><span>STUDIO</span><b>/</b>{NAV_ITEMS.find((item) => item.id === activeTab)?.label}</div>
          <div className={styles.topbarRight}><span className={styles.liveDot} /> Portfolio connecté <span className={styles.dateLabel}>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date())}</span></div>
        </header>

        <div className={styles.content}>
          <div className={styles.pageHeading}>
            <div>
              <p className={styles.eyebrow}>TABLEAU DE BORD · 2026</p>
              <h1>{activeTab === "overview" ? "Vue d’ensemble" : NAV_ITEMS.find((item) => item.id === activeTab)?.label}</h1>
              <p className={styles.subtitle}>Pilotez les contenus et les échanges de votre portfolio.</p>
            </div>
            {activeTab === "projects" && <button className={styles.primaryButton} onClick={() => setProjectEditor({ ...EMPTY_PROJECT })}>＋ Nouveau projet</button>}
            {activeTab === "skills" && <button className={styles.primaryButton} onClick={() => setSkillEditor({ ...EMPTY_SKILL })}>＋ Ajouter une compétence</button>}
          </div>

          {error && <div className={styles.errorBanner} role="alert">{error}<button onClick={() => setError("")} aria-label="Fermer">×</button></div>}
          {notice && <div className={styles.successBanner} role="status">{notice}<button onClick={() => setNotice("")} aria-label="Fermer">×</button></div>}
          {loading && <div className={styles.loadingLine}><span className={styles.loader} />Chargement des données…</div>}

          {activeTab === "overview" && (
            <div className={styles.overview}>
              <div className={styles.metricGrid}>
                <article className={styles.metricCard}><span>Projets</span><strong>{counts.projects}</strong><small>{counts.published} publiés sur le portfolio</small><i>▦</i></article>
                <article className={styles.metricCard}><span>Compétences</span><strong>{counts.skills}</strong><small>Réparties dans {categories.length} catégories</small><i>◈</i></article>
                <article className={styles.metricCard}><span>Messages</span><strong>{counts.messages}</strong><small>Demandes reçues</small><i>✉</i></article>
              </div>
              <section className={styles.panel}>
                <div className={styles.panelHeading}><div><p className={styles.eyebrow}>CONTENU</p><h2>Projets récents</h2></div><button className={styles.textButton} onClick={() => setActiveTab("projects")}>Tous les projets ↗</button></div>
                <div className={styles.recentProjects}>
                  {projects.slice(0, 5).map((project) => (
                    <button className={styles.recentRow} key={project.id} onClick={() => { setActiveTab("projects"); setProjectEditor(project); }}>
                      <span className={styles.projectIcon} style={{ "--accent": project.color }}>{project.icon}</span>
                      <span className={styles.rowTitle}><strong>{project.title}</strong><small>{project.categoryLabel} · {project.year}</small></span>
                      <span className={`${styles.statusBadge} ${project.isPublished ? styles.published : styles.draft}`}>{project.isPublished ? "Publié" : "Brouillon"}</span>
                      <span className={styles.rowArrow}>↗</span>
                    </button>
                  ))}
                  {!projects.length && !loading && <p className={styles.emptyState}>Aucun projet à afficher.</p>}
                </div>
              </section>
              <section className={styles.panel}>
                <div className={styles.panelHeading}><div><p className={styles.eyebrow}>BOÎTE DE RÉCEPTION</p><h2>Derniers messages</h2></div><button className={styles.textButton} onClick={() => setActiveTab("messages")}>Voir les messages ↗</button></div>
                <div className={styles.messagePreview}>
                  {messages.slice(0, 3).map((message) => (
                    <button key={message.id} className={styles.messagePreviewRow} onClick={() => { setActiveTab("messages"); setSelectedMessage(message); }}>
                      <span className={styles.avatar}>{message.name.slice(0, 1).toUpperCase()}</span><span className={styles.rowTitle}><strong>{message.subject}</strong><small>{message.name} · {formatDate(message.createdAt)}</small></span><span className={styles.rowArrow}>↗</span>
                    </button>
                  ))}
                  {!messages.length && !loading && <p className={styles.emptyState}>Aucun message reçu.</p>}
                </div>
              </section>
            </div>
          )}

          {activeTab === "projects" && (
            <section className={styles.panel}>
              <div className={styles.panelHeading}>
                <div><p className={styles.eyebrow}>{projects.length} ÉLÉMENTS</p><h2>Bibliothèque de projets</h2></div>
                <input className={styles.searchInput} type="search" placeholder="Rechercher un projet…" value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <div className={styles.projectList}>
                {filteredProjects.map((project) => (
                  <article key={project.id} className={styles.projectRow}>
                    <span className={styles.projectIcon} style={{ "--accent": project.color }}>{project.icon}</span>
                    <div className={styles.rowTitle}><strong>{project.title}</strong><small>{project.categoryLabel} · {project.year} · {(project.tech || []).slice(0, 3).join(", ")}</small></div>
                    <span className={`${styles.statusBadge} ${project.isPublished ? styles.published : styles.draft}`}>{project.isPublished ? "Publié" : "Brouillon"}</span>
                    <div className={styles.rowActions}><button onClick={() => setProjectEditor(project)}>Modifier</button><button className={styles.dangerText} onClick={() => deleteProject(project)} disabled={busy}>Supprimer</button></div>
                  </article>
                ))}
                {!filteredProjects.length && !loading && <p className={styles.emptyState}>Aucun projet trouvé.</p>}
              </div>
            </section>
          )}

          {activeTab === "skills" && (
            <div className={styles.skillCategories}>
              {categories.map((category) => (
                <section key={category.slug} className={styles.panel}>
                  <div className={styles.panelHeading}>
                    <div className={styles.categoryTitle}><span className={styles.categoryIcon} style={{ "--accent": category.color }}>{category.icon}</span><div><p className={styles.eyebrow}>CATÉGORIE</p><h2>{category.category}</h2></div></div>
                    <span className={styles.countBadge}>{category.items.length} compétences</span>
                  </div>
                  <div className={styles.skillRows}>
                    {category.items.map((skill) => (
                      <div className={styles.skillRow} key={skill.id}>
                        <div className={styles.rowTitle}><strong>{skill.name}</strong><div className={styles.skillTrack}><span style={{ width: `${skill.level}%`, "--accent": category.color }} /></div></div>
                        <span className={styles.skillPercent}>{skill.level}%</span>
                        <div className={styles.rowActions}><button onClick={() => setSkillEditor({ ...skill, categorySlug: category.slug })}>Modifier</button><button className={styles.dangerText} onClick={() => deleteSkill(skill)} disabled={busy}>Supprimer</button></div>
                      </div>
                    ))}
                    {!category.items.length && <p className={styles.emptyState}>Aucune compétence dans cette catégorie.</p>}
                  </div>
                </section>
              ))}
            </div>
          )}

          {activeTab === "messages" && (
            <section className={styles.panel}>
              <div className={styles.panelHeading}><div><p className={styles.eyebrow}>{messages.length} REÇUS</p><h2>Messages de contact</h2></div><span className={styles.privacyNote}>Conservation automatique : 12 mois</span></div>
              <div className={styles.messageList}>
                {messages.map((message) => (
                  <article className={styles.messageRow} key={message.id}>
                    <span className={styles.avatar}>{message.name.slice(0, 1).toUpperCase()}</span>
                    <button className={styles.messageDetails} onClick={() => setSelectedMessage(message)}>
                      <strong>{message.subject}</strong><span>{message.name} · {message.email}</span><small>{formatDate(message.createdAt)}</small>
                    </button>
                    <button className={styles.iconButton} onClick={() => deleteMessage(message)} disabled={busy} aria-label={`Supprimer le message de ${message.name}`}>⌫</button>
                  </article>
                ))}
                {!messages.length && !loading && <p className={styles.emptyState}>La boîte de réception est vide.</p>}
              </div>
            </section>
          )}
        </div>
      </section>

      {projectEditor && <ProjectEditor project={projectEditor.id ? projectEditor : null} onSave={saveProject} onClose={() => setProjectEditor(null)} busy={busy} />}
      {skillEditor && <SkillEditor skill={skillEditor.id ? skillEditor : null} categories={categories} onSave={saveSkill} onClose={() => setSkillEditor(null)} busy={busy} />}
      {selectedMessage && (
        <div className={styles.modalBackdrop} onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedMessage(null);
        }}>
          <article className={`${styles.editor} ${styles.messageModal}`}>
            <div className={styles.modalHeader}><div><p className={styles.eyebrow}>MESSAGE REÇU · {formatDate(selectedMessage.createdAt)}</p><h2>{selectedMessage.subject}</h2></div><button className={styles.iconButton} onClick={() => setSelectedMessage(null)} aria-label="Fermer">×</button></div>
            <p className={styles.messageSender}><strong>{selectedMessage.name}</strong><a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a></p>
            <p className={styles.messageBody}>{selectedMessage.message}</p>
            <div className={styles.modalActions}><a className={styles.secondaryButton} href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}`}>Répondre par e-mail ↗</a><button className={styles.dangerButton} onClick={() => deleteMessage(selectedMessage)} disabled={busy}>Supprimer</button></div>
          </article>
        </div>
      )}
    </main>
  );
}
