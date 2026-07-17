"use client";

import { useState } from "react";
import { PortalShell } from "../../components/shell/portal-shell";
import { PublicFooter, PublicHeader } from "../../components/shell/public-shell";
import {
  Accordion,
  Badge,
  BottomSheet,
  Button,
  Card,
  Checkbox,
  Dialog,
  Drawer,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Select,
  Skeleton,
  Switch,
  Tabs,
  Textarea,
  Toast,
} from "../../components/ui/primitives";

export default function DesignSystemDemo() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [switchOn, setSwitchOn] = useState(true);

  const tabs = [
    {
      value: "landing",
      label: "Landing",
      content: <p>Conteúdo público com CTAs, formulário e prova social.</p>,
    },
    {
      value: "portal",
      label: "Portal",
      content: <p>Conteúdo privado com processos, prazos e documentos.</p>,
    },
    {
      value: "states",
      label: "Estados",
      content: <p>Loading, vazio, erro, sucesso e sem permissão.</p>,
    },
  ];

  const accordionItems = [
    {
      value: "faq-1",
      label: "Como acompanho meu processo?",
      content: <p>O portal organiza andamentos, prazos, documentos e mensagens em linguagem simples.</p>,
    },
    {
      value: "faq-2",
      label: "Posso enviar documentos pelo celular?",
      content: <p>Sim. O upload deve validar tipo, tamanho e autorização antes de persistir.</p>,
    },
  ];

  return (
    <div className="vm-demo-page">
      <PublicHeader activePath="/" />
      <section className="vm-demo-hero">
        <div className="vm-demo-container">
          <Badge tone="warning">Fase 1</Badge>
          <h1>Fundação mobile-first</h1>
          <p>Tokens, primitivos, shells responsivos e acessibilidade base para a landing e área do cliente.</p>
          <div className="vm-demo-inline">
            <Button onClick={() => setSheetOpen(true)}>Abrir bottom sheet</Button>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
              Abrir drawer
            </Button>
          </div>
        </div>
      </section>

      <main className="vm-demo-container" id="conteudo-principal">
        <section className="vm-demo-section">
          <h2>Primitivos</h2>
          <div className="vm-demo-grid">
            <Card title="Ações" description="Botões com alvo mínimo de toque">
              <div className="vm-demo-inline">
                <Button>Primário</Button>
                <Button variant="portal">Portal</Button>
                <Button variant="secondary">Secundário</Button>
                <Button variant="ghost">Discreto</Button>
              </div>
            </Card>

            <Card title="Formulários" description="Labels, ajuda e erro associados">
              <div className="vm-demo-stack">
                <Field htmlFor="demo-name" label="Nome completo" help="Use o nome do documento.">
                  <Input id="demo-name" placeholder="João da Silva" />
                </Field>
                <Field htmlFor="demo-area" label="Área jurídica">
                  <Select id="demo-area" defaultValue="">
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option>Direito Civil</option>
                    <option>Direito de Família</option>
                  </Select>
                </Field>
                <Field htmlFor="demo-message" label="Mensagem" error="Descreva brevemente sua necessidade.">
                  <Textarea id="demo-message" error placeholder="Conte em poucas linhas" />
                </Field>
                <Checkbox label="Aceito a política de privacidade" description="Consentimento LGPD obrigatório." />
                <Switch
                  checked={switchOn}
                  label="Receber notificações"
                  description="Prazos e mensagens importantes."
                  onCheckedChange={setSwitchOn}
                />
              </div>
            </Card>

            <Card title="Badges" description="Estado nunca depende só da cor">
              <div className="vm-demo-inline">
                <Badge tone="success">Concluído</Badge>
                <Badge tone="warning">Prazo próximo</Badge>
                <Badge tone="danger">Atrasado</Badge>
                <Badge tone="info">Em análise</Badge>
                <Badge>Pendente</Badge>
              </div>
            </Card>

            <Card title="Estados" description="Loading, vazio e erro">
              <div className="vm-demo-stack">
                <Skeleton style={{ height: 44 }} />
                <EmptyState title="Nenhum documento" description="Quando houver arquivos, eles aparecerão aqui." />
                <ErrorState
                  description="A tentativa falhou sem expor detalhes técnicos."
                  action={<Button variant="secondary">Tentar novamente</Button>}
                />
              </div>
            </Card>

            <Card title="Tabs e FAQ" description="Sem depender de hover">
              <Tabs items={tabs} />
              <Accordion items={accordionItems} />
            </Card>

            <Card title="Camadas" description="Dialog, drawer e bottom sheet">
              <div className="vm-demo-inline">
                <Button variant="secondary" onClick={() => setDialogOpen(true)}>
                  Dialog
                </Button>
                <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
                  Drawer
                </Button>
                <Button variant="secondary" onClick={() => setSheetOpen(true)}>
                  Bottom sheet
                </Button>
              </div>
            </Card>
          </div>
        </section>

        <section className="vm-demo-section">
          <h2>Portal shell</h2>
          <div className="vm-demo-portal-frame">
            <PortalShell>
              <div className="vm-demo-grid">
                <Card title="Processos ativos" description="Resumo prioritário no mobile">
                  <strong>3 processos</strong>
                </Card>
                <Card title="Próximo prazo" description="Audiência em 20/07/2026">
                  <Badge tone="warning">Atenção</Badge>
                </Card>
                <Card title="Documentos" description="Pendências do cliente">
                  <Button variant="portal" full>
                    Enviar documento
                  </Button>
                </Card>
              </div>
            </PortalShell>
          </div>
        </section>
      </main>

      <PublicFooter />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title="Confirmação" description="Exemplo de modal acessível">
        <p>O foco fica preso enquanto o modal estiver aberto e Escape fecha a camada.</p>
        <Button full onClick={() => setDialogOpen(false)}>
          Entendi
        </Button>
      </Dialog>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} title="Menu lateral" description="Padrão para navegação extensa">
        <div className="vm-demo-stack">
          <Button variant="secondary" full>
            Processos
          </Button>
          <Button variant="secondary" full>
            Documentos
          </Button>
          <Button variant="secondary" full>
            Mensagens
          </Button>
        </div>
      </Drawer>
      <BottomSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Ação rápida"
        description="No mobile, detalhes e ações contextuais aparecem como bottom sheet"
      >
        <div className="vm-demo-stack">
          <Button full>Solicitar análise jurídica</Button>
          <Button variant="secondary" full>
            Falar no WhatsApp
          </Button>
        </div>
      </BottomSheet>
      <Toast title="Design system carregado" description="Base pronta para as próximas fases." />
    </div>
  );
}
