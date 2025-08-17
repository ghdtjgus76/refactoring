function statement(invoice, plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `청구 내역 (고객명: ${invoice.customer})\n`;

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
    }).format(number);
  }

  for (let performance of invoice.performances) {
    const thisAmount = amountFor(performance);
    const play = playFor(performance);
    volumeCredits += volumeCreditsFor(performance);

    result += ` ${play.name}: ${usd(thisAmount / 100)} (${
      performance.audience
    }석)\n`;
    totalAmount += thisAmount;
  }

  result += `총액 ${usd(totalAmount / 100)}\n`;
  result += `적립 포인트: ${volumeCredits}점\n`;
  return result;
}
