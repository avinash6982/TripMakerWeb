import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();

  return (
    <main className="home-page">
      <section className="container home-card">
        <h1>{t("home.title")}</h1>
        <p className="muted">{t("home.subtitle")}</p>
      </section>
    </main>
  );
};

export default Home;
