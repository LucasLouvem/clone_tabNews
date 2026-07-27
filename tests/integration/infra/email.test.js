import email from "infra/email.js";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.deleteEmail();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await email.send({
      from: "Lucas <lucas@teste.com.br>",
      to: "contato@curso.dev",
      subject: "Teste de assunto",
      text: "teste de corpo de email",
    });

    await email.send({
      from: "Louvem <Louvem@teste.com.br>",
      to: "teste@email.com",
      subject: "Teste de assunto novo",
      text: "teste de corpo novo",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<Louvem@teste.com.br>");
    expect(lastEmail.recipients[0]).toBe("<teste@email.com>");
    expect(lastEmail.subject).toBe("Teste de assunto novo");
    expect(lastEmail.text).toBe("teste de corpo novo\n");
  });
});
