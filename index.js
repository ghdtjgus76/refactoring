function statement(invoice, plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `청구 내역 (고객명: ${invoice.customer})\n`;
  const format = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format;

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

  for (let performance of invoice.performances) {
    let thisAmount = amountFor(performance);
    const play = playFor(performance);

    volumeCredits += Math.max(performance.audience - 30, 0);

    if (play.type === "comedy") {
      volumeCredits += Math.floor(performance.audience / 5);
    }

    result += ` ${play.name}: ${format(thisAmount / 100)} (${
      performance.audience
    }석)\n`;
    totalAmount += thisAmount;
  }

  result += `총액 ${format(totalAmount / 100)}\n`;
  result += `적립 포인트: ${volumeCredits}점\n`;
  return result;
}
