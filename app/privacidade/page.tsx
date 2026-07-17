import React from 'react';

export const metadata = {
  title: 'Política de Privacidade | Amariti',
  description: 'Política de Privacidade do aplicativo Amariti (ContentHub Pro).',
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
        <p className="text-sm text-gray-500 mb-8">Última atualização: 17 de Julho de 2026</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introdução</h2>
            <p>
              O Amariti ("nós", "nosso") está comprometido em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações ao utilizar nosso aplicativo ContentHub Pro, que é uma ferramenta estritamente de uso interno para automação de mídias.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Dados Coletados via Integrações (Ex: TikTok API)</h2>
            <p>
              Quando o Amariti se conecta a APIs de terceiros (como o TikTok Login Kit e Content Posting API), coletamos apenas as informações necessárias para operar o serviço:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Informações Básicas de Perfil:</strong> Nome de usuário e foto do perfil para exibir no painel interno.</li>
              <li><strong>Tokens de Acesso (Access Tokens):</strong> Tokens criptografados usados exclusivamente para publicar conteúdo em nome do perfil autenticado.</li>
            </ul>
            <p className="mt-2">
              <strong>Importante:</strong> Não coletamos, não lemos e não temos acesso às mensagens privadas, senhas ou dados financeiros dos usuários das plataformas de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Como Usamos as Informações</h2>
            <p>
              As informações coletadas são usadas de forma limitada para:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Facilitar o agendamento e a publicação automática de vídeos na conta autenticada.</li>
              <li>Manter a sessão ativa e segura durante o uso da ferramenta interna.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Retenção e Exclusão de Dados</h2>
            <p>
              Nós armazenamos tokens de acesso de forma segura e não os compartilhamos com terceiros. Os usuários podem revogar o acesso do Amariti a qualquer momento através das configurações de privacidade da sua própria conta do TikTok/Google. Ao revogar o acesso, nós excluiremos imediatamente os tokens armazenados em nosso banco de dados.
            </p>
            <p className="mt-2">
              Se você deseja solicitar a exclusão de todos os seus dados associados ao nosso aplicativo, entre em contato conosco diretamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Segurança</h2>
            <p>
              Implementamos medidas de segurança rígidas a nível de servidor para garantir que seus tokens de acesso a APIs de terceiros não sejam expostos ou comprometidos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Contato</h2>
            <p>
              Para qualquer dúvida sobre esta política ou sobre o processamento de seus dados em relação às APIs integradas, contate o responsável pelo sistema internamente.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
