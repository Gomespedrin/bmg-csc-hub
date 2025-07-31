import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, ExternalLink, HelpCircle } from "lucide-react";
import { useFAQ } from "@/hooks/useFAQ";

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  const { data: faqData, isLoading: faqLoading } = useFAQ();
  const [showFullFAQ, setShowFullFAQ] = useState(false);

  // Agrupar FAQ por categoria
  const faqByCategory = faqData?.reduce((acc: any, item: any) => {
    if (!acc[item.categoria]) {
      acc[item.categoria] = [];
    }
    acc[item.categoria].push(item);
    return acc;
  }, {}) || {};

  const categories = Object.keys(faqByCategory);
  const featuredFAQ = categories.slice(0, 2); // Mostrar apenas 2 categorias no rodapé

  return (
    <footer className={`bg-card border-t ${className}`}>
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Informações do Portal */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Portal CSC
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Centro de Serviços Compartilhados do Grupo BMG
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>csc@bmg.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(31) 3201-7000</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Belo Horizonte, MG</span>
              </div>
            </div>
          </div>

          {/* FAQ em Destaque */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Perguntas Frequentes
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullFAQ(!showFullFAQ)}
              >
                {showFullFAQ ? "Ver Menos" : "Ver Todas"}
              </Button>
            </div>

            {faqLoading ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {(showFullFAQ ? categories : featuredFAQ).map((category) => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <span>{category}</span>
                        <Badge variant="secondary" className="text-xs">
                          {faqByCategory[category].length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {faqByCategory[category].map((item: any) => (
                          <div key={item.id} className="border-l-2 border-primary/20 pl-4">
                            <h4 className="text-sm font-medium text-foreground mb-1">
                              {item.pergunta}
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {item.resposta}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          {/* Links Úteis */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Links Úteis
            </h3>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start h-auto p-2">
                <ExternalLink className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="text-sm font-medium">Portal do Colaborador</div>
                  <div className="text-xs text-muted-foreground">Acesse o portal interno</div>
                </div>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start h-auto p-2">
                <ExternalLink className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="text-sm font-medium">Suporte Técnico</div>
                  <div className="text-xs text-muted-foreground">Entre em contato</div>
                </div>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start h-auto p-2">
                <ExternalLink className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="text-sm font-medium">Documentação</div>
                  <div className="text-xs text-muted-foreground">Guias e manuais</div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <div>
            © 2024 Portal CSC - Centro de Serviços Compartilhados. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span>Versão 1.0.0</span>
            <span>•</span>
            <span>Última atualização: {new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
} 