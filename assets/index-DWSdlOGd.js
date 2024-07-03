import{p as m,j as C,s as b,r as y,O as w,k as x,l as f,m as p,S as _,x as h,n as v,E as c,o as E,A as I,C as $,M as O,R}from"./index-3uMRYX7C.js";const s=m({status:"uninitialized"}),u={state:s,subscribeKey(t,e){return C(s,t,e)},subscribe(t){return b(s,()=>t(s))},_getClient(){if(!s._client)throw new Error("SIWEController client not set");return s._client},async getNonce(t){const n=await this._getClient().getNonce(t);return this.setNonce(n),n},async getSession(){const e=await this._getClient().getSession();return e&&(this.setSession(e),this.setStatus("success")),e},createMessage(t){const n=this._getClient().createMessage(t);return this.setMessage(n),n},async verifyMessage(t){return await this._getClient().verifyMessage(t)},async signIn(){return await this._getClient().signIn()},async signOut(){var e;const t=this._getClient();await t.signOut(),this.setStatus("ready"),(e=t.onSignOut)==null||e.call(t)},onSignIn(t){var n;const e=this._getClient();(n=e.onSignIn)==null||n.call(e,t)},onSignOut(){var e;const t=this._getClient();(e=t.onSignOut)==null||e.call(t)},setSIWEClient(t){s._client=y(t),s.status="ready",w.setIsSiweEnabled(t.options.enabled)},setNonce(t){s.nonce=t},setStatus(t){s.status=t},setMessage(t){s.message=t},setSession(t){s.session=t}},j=x`
  :host {
    display: flex;
    justify-content: center;
    gap: var(--wui-spacing-2xl);
  }

  wui-visual-thumbnail:nth-child(1) {
    z-index: 1;
  }
`;var W=function(t,e,n,a){var o=arguments.length,i=o<3?e:a===null?a=Object.getOwnPropertyDescriptor(e,n):a,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,a);else for(var l=t.length-1;l>=0;l--)(r=t[l])&&(i=(o<3?r(i):o>3?r(e,n,i):r(e,n))||i);return o>3&&i&&Object.defineProperty(e,n,i),i};let g=class extends p{constructor(){var e;super(...arguments),this.dappImageUrl=(e=w.state.metadata)==null?void 0:e.icons,this.walletImageUrl=_.getConnectedWalletImageUrl()}firstUpdated(){var n;const e=(n=this.shadowRoot)==null?void 0:n.querySelectorAll("wui-visual-thumbnail");e!=null&&e[0]&&this.createAnimation(e[0],"translate(18px)"),e!=null&&e[1]&&this.createAnimation(e[1],"translate(-18px)")}render(){var e;return h`
      <wui-visual-thumbnail
        ?borderRadiusFull=${!0}
        .imageSrc=${(e=this.dappImageUrl)==null?void 0:e[0]}
      ></wui-visual-thumbnail>
      <wui-visual-thumbnail .imageSrc=${this.walletImageUrl}></wui-visual-thumbnail>
    `}createAnimation(e,n){e.animate([{transform:"translateX(0px)"},{transform:n}],{duration:1600,easing:"cubic-bezier(0.56, 0, 0.48, 1)",direction:"alternate",iterations:1/0})}};g.styles=j;g=W([f("w3m-connecting-siwe")],g);var S=function(t,e,n,a){var o=arguments.length,i=o<3?e:a===null?a=Object.getOwnPropertyDescriptor(e,n):a,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,a);else for(var l=t.length-1;l>=0;l--)(r=t[l])&&(i=(o<3?r(i):o>3?r(e,n,i):r(e,n))||i);return o>3&&i&&Object.defineProperty(e,n,i),i};let d=class extends p{constructor(){var e;super(...arguments),this.dappName=(e=w.state.metadata)==null?void 0:e.name,this.isSigning=!1}render(){return h`
      <wui-flex justifyContent="center" .padding=${["2xl","0","xxl","0"]}>
        <w3m-connecting-siwe></w3m-connecting-siwe>
      </wui-flex>
      <wui-flex
        .padding=${["0","4xl","l","4xl"]}
        gap="s"
        justifyContent="space-between"
      >
        <wui-text variant="paragraph-500" align="center" color="fg-100"
          >${this.dappName??"Dapp"} needs to connect to your wallet</wui-text
        >
      </wui-flex>
      <wui-flex
        .padding=${["0","3xl","l","3xl"]}
        gap="s"
        justifyContent="space-between"
      >
        <wui-text variant="small-400" align="center" color="fg-200"
          >Sign this message to prove you own this wallet and proceed. Canceling will disconnect
          you.</wui-text
        >
      </wui-flex>
      <wui-flex .padding=${["l","xl","xl","xl"]} gap="s" justifyContent="space-between">
        <wui-button
          size="md"
          ?fullwidth=${!0}
          variant="shade"
          @click=${this.onCancel.bind(this)}
          data-testid="w3m-connecting-siwe-cancel"
        >
          Cancel
        </wui-button>
        <wui-button
          size="md"
          ?fullwidth=${!0}
          variant="fill"
          @click=${this.onSign.bind(this)}
          ?loading=${this.isSigning}
          data-testid="w3m-connecting-siwe-sign"
        >
          ${this.isSigning?"Signing...":"Sign"}
        </wui-button>
      </wui-flex>
    `}async onSign(){this.isSigning=!0,c.sendEvent({event:"CLICK_SIGN_SIWE_MESSAGE",type:"track"});try{u.setStatus("loading");const e=await u.signIn();return u.setStatus("success"),c.sendEvent({event:"SIWE_AUTH_SUCCESS",type:"track"}),e}catch{return E.showError("Signature declined"),u.setStatus("error"),c.sendEvent({event:"SIWE_AUTH_ERROR",type:"track"})}finally{this.isSigning=!1}}async onCancel(){const{isConnected:e}=I.state;e?(await $.disconnect(),O.close()):R.push("Connect"),c.sendEvent({event:"CLICK_CANCEL_SIWE",type:"track"})}};S([v()],d.prototype,"isSigning",void 0);d=S([f("w3m-connecting-siwe-view")],d);export{u as SIWEController,g as W3mConnectingSiwe,d as W3mConnectingSiweView};
