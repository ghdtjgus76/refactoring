function statement(invoice, plays) {
  return renderPlainText(createStatementData(invoice));

  function createStatementData(invoice) {
    const statementData = {};
    statementData.customer = invoice.customer;
    statementData.performances = invoice.performances.map(enrichPerformance);
    statementData.totalAmount = totalAmount(statementData);
    statementData.totalVolumeCredits = totalVolumeCredits(statementData);

    return statementData;
  }

  function playFor(performance) {
    return plays[performance.playId];
  }

  function amountFor(performance) {
    const play = playFor(performance);
    let result = 0;

    switch (play.type) {
      case "tragedy":
        result = 40000;
        if (performance.audience > 30) {
          result += 1000 * (performance.audience - 30);
        }
        break;
      case "comedy":
        result = 30000;
        if (performance.audience > 20) {
          result += 10000 + 500 * (performance.audience - 20);
        }
        result += 300 * performance.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르: ${play.type}`);
    }

    return result;
  }

  function volumeCreditsFor(performance) {
    let result = 0;
    const play = playFor(performance);
    result += Math.max(performance.audience - 30, 0);
    if (play.type === "comedy") {
      result += Math.floor(performance.audience / 5);
    }
    return result;
  }

  function usd(number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(number / 100);
  }

  function totalVolumeCredits(data) {
    return data.performance.reduce((total, p) => total + p.volumeCredits, 0);
  }

  function totalAmount(data) {
    return data.performances.reduce((total, p) => total + p.amount, 0);
  }

  function enrichPerformance(performance) {
    const result = Object.assign({}, performance);
    result.play = playFor(result);
    result.amount = amountFor(result);
    result.volumeCredits = volumeCreditsFor(result);
    return result;
  }

  function renderPlainText(data) {
    let result = `청구 내역 (고객명: ${data.customer})\n`;

    for (let performance of data.performances) {
      result += ` ${performance.play.name}: ${usd(performance.amount)} (${
        performance.audience
      }석)\n`;
    }

    result += `총액 ${usd(data.totalAmount)}\n`;
    result += `적립 포인트: ${data.volumeCredits}점\n`;
    return result;
  }
}
