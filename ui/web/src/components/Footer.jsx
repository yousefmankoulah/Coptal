import { Footer } from "flowbite-react";
import { Link } from "react-router-dom";
import {
  BsFacebook,
  BsInstagram,
  BsGithub,
  BsLinkedin,
} from "react-icons/bs";

export default function FooterCom() {
  return (
    <Footer container className="border border-t-8 border-teal-500">
      <div className="w-full sm:flex sm:items-center sm:justify-between">
        <Footer.Copyright
          href="https://www.linkedin.com/in/yousef-mankoulah-967a9913b/"
          by="Yousef Mankoulah"
          year={new Date().getFullYear()}
        />
        <div className="flex gap-6 sm:mt-0 mt-4 sm:justify-center">
          <Footer.Icon
            href="https://www.facebook.com/yousef.abdelrahman.906/"
            icon={BsFacebook}
          />
          <Footer.Icon
            href="https://www.instagram.com/yousefabdelrahman906/"
            icon={BsInstagram}
          />
          <Footer.Icon
            href="https://www.linkedin.com/in/yousef-mankoulah-967a9913b/"
            icon={BsLinkedin}
          />
          <Footer.Icon
            href="https://github.com/yousefmankoulah"
            icon={BsGithub}
          />
        </div>
      </div>
    </Footer>
  );
}