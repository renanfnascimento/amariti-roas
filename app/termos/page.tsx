import React from 'react';

export const metadata = {
  title: 'Termos de Serviço | Amariti',
  description: 'Termos de Serviço do aplicativo Amariti (ContentHub Pro).',
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold mb-6">Termos de Serviço</h1>
        <p className="text-sm text-gray-500 mb-8">Última atualização: 17 de Julho de 2026</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar o aplicativo Amariti (ContentHub Pro), você concorda em cumprir e estar vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços. O Amariti é uma ferramenta de uso estritamente interno da equipe.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Uso do Serviço e Integração com APIs</h2>
            <p>
              Nosso sistema utiliza integrações com plataformas de terceiros, incluindo, mas não se limitando a, TikTok, Google Drive e Meta. Ao autenticar o aplicativo Amariti com sua conta nessas plataformas, você autoriza o aplicativo a realizar ações limitadas ao escopo da automação de publicações (Content Posting API).
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>O usuário concorda em não usar o sistema para publicar conteúdo que viole as diretrizes da comunidade das plataformas integradas.</li>
              <li>O usuário concorda em não utilizar bots, scrapers ou outros métodos não autorizados para acessar a API fora dos limites estabelecidos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Responsabilidades</h2>
            <p>
              O Amariti não se responsabiliza por:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Suspensões de conta ou restrições impostas por plataformas de terceiros devido ao conteúdo postado.</li>
              <li>Interrupções de serviço causadas por instabilidades nas APIs de terceiros.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Modificações dos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes Termos a qualquer momento. Modificações significativas serão notificadas internamente à equipe. O uso contínuo do serviço após as alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Contato</h2>
            <p>
              Para dúvidas relacionadas a estes Termos de Serviço ou sobre a integração com a API do TikTok, entre em contato através do e-mail do administrador do sistema.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
